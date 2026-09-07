import unittest
import json
from app import create_app

class TestAccommodationAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app()
        cls.client = cls.app.test_client()

    def test_health_check(self):
        res = self.client.get('/api/health')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['status'], 'healthy')
        print("PASS: Health check")

    def test_properties_listing(self):
        res = self.client.get('/api/properties')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn('properties', data)
        self.assertGreater(len(data['properties']), 0)
        print(f"PASS: Listed {len(data['properties'])} approved properties")

    def test_properties_filter_by_city(self):
        res = self.client.get('/api/properties?city=Saapade')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        for p in data['properties']:
            self.assertEqual(p['city'].lower(), 'saapade')
        print(f"PASS: Filtered by city Saapade, found {len(data['properties'])} properties")

    def test_auth_login_and_roles(self):
        # 1. Admin login
        admin_res = self.client.post('/api/auth/login', json={
            'email': 'admin@saapadeaccommodation.ng',
            'password': 'Admin123!'
        })
        self.assertEqual(admin_res.status_code, 200)
        admin_token = admin_res.get_json()['token']
        print("PASS: Admin login successful")

        # 2. Agent login
        agent_res = self.client.post('/api/auth/login', json={
            'email': 'adebayo@gatewayrealty.ng',
            'password': 'Agent123!'
        })
        self.assertEqual(agent_res.status_code, 200)
        agent_token = agent_res.get_json()['token']
        print("PASS: Agent login successful")

        # 3. Student login
        student_res = self.client.post('/api/auth/login', json={
            'email': 'student@student.gaposa.edu.ng',
            'password': 'Student123!'
        })
        self.assertEqual(student_res.status_code, 200)
        student_token = student_res.get_json()['token']
        print("PASS: Student login successful")

        # 4. Admin stats access by Admin
        stats_res = self.client.get('/api/admin/stats', headers={'Authorization': f'Bearer {admin_token}'})
        self.assertEqual(stats_res.status_code, 200)
        stats = stats_res.get_json()['stats']
        print(f"PASS: Admin stats fetched: {stats['total_properties']} properties, {stats['total_users']} users")

        # 5. Admin stats access by Student (Must be forbidden 403)
        forbidden_res = self.client.get('/api/admin/stats', headers={'Authorization': f'Bearer {student_token}'})
        self.assertEqual(forbidden_res.status_code, 403)
        print("PASS: Role-based authorization correctly rejected Student from Admin endpoint (403)")

        # 6. Student favorites
        fav_res = self.client.get('/api/favorites', headers={'Authorization': f'Bearer {student_token}'})
        self.assertEqual(fav_res.status_code, 200)
        favs = fav_res.get_json()['favorites']
        print(f"PASS: Student favorites fetched ({len(favs)} saved properties)")

if __name__ == '__main__':
    unittest.main()
