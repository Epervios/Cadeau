import requests
import sys
import json
from datetime import datetime

class SecretSantaAPITester:
    def __init__(self, base_url="https://family-draw-system.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.admin_token = None
        self.user_token = None
        self.test_user_id = None
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {json.dumps(error_data, indent=2)}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "", 200)

    def test_admin_login(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={
                "email": "eric.savary@netplus.ch",
                "password": "x4Q45jUn7Hxq4M"
            }
        )
        if success and 'token' in response:
            self.admin_token = response['token']
            print(f"   Admin token obtained: {self.admin_token[:20]}...")
            return True
        return False

    def test_user_registration(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={
                "first_name": f"TestUser{timestamp}",
                "email": f"test{timestamp}@example.com",
                "password": "TestPass123!"
            }
        )
        if success and 'user_id' in response:
            self.test_user_id = response['user_id']
            print(f"   Test user ID: {self.test_user_id}")
            return True
        return False

    def test_user_login_before_approval(self):
        """Test user login before admin approval (should fail or show pending)"""
        timestamp = datetime.now().strftime('%H%M%S')
        success, response = self.run_test(
            "User Login Before Approval",
            "POST",
            "auth/login",
            200,  # Login succeeds but user is not approved
            data={
                "email": f"test{timestamp}@example.com",
                "password": "TestPass123!"
            }
        )
        if success:
            # Check if user is not approved
            user_data = response.get('user', {})
            if not user_data.get('is_approved', True):
                print("   ✅ User login successful but not approved (as expected)")
                return True
        return False

    def test_get_pending_users(self):
        """Test getting pending users (admin only)"""
        if not self.admin_token:
            print("❌ No admin token available")
            return False
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.admin_token}'
        }
        return self.run_test("Get Pending Users", "GET", "admin/pending-users", 200, headers=headers)

    def test_approve_user(self):
        """Test approving a user"""
        if not self.admin_token or not self.test_user_id:
            print("❌ No admin token or test user ID available")
            return False
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.admin_token}'
        }
        return self.run_test(
            "Approve User", 
            "POST", 
            f"admin/approve-user?user_id={self.test_user_id}", 
            200, 
            data={}, 
            headers=headers
        )

    def test_get_all_users(self):
        """Test getting all users (admin only)"""
        if not self.admin_token:
            print("❌ No admin token available")
            return False
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.admin_token}'
        }
        return self.run_test("Get All Users", "GET", "admin/users", 200, headers=headers)

    def test_user_login_after_approval(self):
        """Test user login after approval"""
        timestamp = datetime.now().strftime('%H%M%S')
        success, response = self.run_test(
            "User Login After Approval",
            "POST",
            "auth/login",
            200,
            data={
                "email": f"test{timestamp}@example.com",
                "password": "TestPass123!"
            }
        )
        if success and 'token' in response:
            self.user_token = response['token']
            print(f"   User token obtained: {self.user_token[:20]}...")
            return True
        return False

    def test_draw_status_before_draw(self):
        """Test draw status before creating draw"""
        return self.run_test("Draw Status Before Draw", "GET", "draw/status", 200)

    def test_create_draw(self):
        """Test creating Secret Santa draw"""
        if not self.admin_token:
            print("❌ No admin token available")
            return False
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.admin_token}'
        }
        return self.run_test("Create Draw", "POST", "admin/draw", 200, data={}, headers=headers)

    def test_draw_status_after_draw(self):
        """Test draw status after creating draw"""
        return self.run_test("Draw Status After Draw", "GET", "draw/status", 200)

    def test_user_assignment(self):
        """Test getting user assignment"""
        if not self.user_token:
            print("❌ No user token available")
            return False
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.user_token}'
        }
        return self.run_test("Get User Assignment", "GET", "user/assignment", 200, headers=headers)

    def test_duplicate_draw_prevention(self):
        """Test that duplicate draws for same year are prevented"""
        if not self.admin_token:
            print("❌ No admin token available")
            return False
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.admin_token}'
        }
        success, response = self.run_test(
            "Duplicate Draw Prevention", 
            "POST", 
            "admin/draw", 
            400,  # Should fail with 400
            data={}, 
            headers=headers
        )
        return success

def main():
    print("🎄 Secret Santa API Testing Suite 🎅")
    print("=" * 50)
    
    tester = SecretSantaAPITester()
    
    # Test sequence
    tests = [
        ("Root Endpoint", tester.test_root_endpoint),
        ("Admin Login", tester.test_admin_login),
        ("User Registration", tester.test_user_registration),
        ("User Login Before Approval", tester.test_user_login_before_approval),
        ("Get Pending Users", tester.test_get_pending_users),
        ("Approve User", tester.test_approve_user),
        ("Get All Users", tester.test_get_all_users),
        ("User Login After Approval", tester.test_user_login_after_approval),
        ("Draw Status Before Draw", tester.test_draw_status_before_draw),
        ("Create Draw", tester.test_create_draw),
        ("Draw Status After Draw", tester.test_draw_status_after_draw),
        ("User Assignment", tester.test_user_assignment),
        ("Duplicate Draw Prevention", tester.test_duplicate_draw_prevention),
    ]
    
    print(f"\nRunning {len(tests)} tests...\n")
    
    for test_name, test_func in tests:
        try:
            test_func()
        except Exception as e:
            print(f"❌ {test_name} - Exception: {str(e)}")
            tester.tests_run += 1
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    success_rate = (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0
    print(f"📈 Success Rate: {success_rate:.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed! Backend is working correctly.")
        return 0
    else:
        print("⚠️  Some tests failed. Check the issues above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())