"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, User, Settings, CheckCircle, AlertCircle } from "lucide-react"

export default function AdminSetupGuide() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center text-red-800">
            <Shield className="h-6 w-6 mr-2" />
            Admin Setup Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Cloudinary Setup */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-lg">Step 1: Cloudinary Setup ✅</h3>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm text-gray-600 mb-3">
                Your Cloudinary credentials are configured! Now create an upload preset:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>
                  Go to{" "}
                  <a
                    href="https://cloudinary.com/console"
                    target="_blank"
                    className="text-blue-600 underline"
                    rel="noreferrer"
                  >
                    Cloudinary Console
                  </a>
                </li>
                <li>Navigate to Settings → Upload → Upload presets</li>
                <li>Click "Add upload preset"</li>
                <li>
                  Set preset name: <Badge className="bg-blue-100 text-blue-800">skillswap_profiles</Badge>
                </li>
                <li>Set signing mode to "Unsigned"</li>
                <li>
                  Set folder to: <Badge className="bg-green-100 text-green-800">skillswap/profiles</Badge>
                </li>
                <li>Enable cropping and set aspect ratio to 1:1 (square)</li>
                <li>Save the preset</li>
              </ol>
            </div>
          </div>

          {/* Step 2: Create Admin User */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <h3 className="font-semibold text-lg">Step 2: Create Admin User</h3>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm text-gray-600 mb-3">Choose one of these methods to create an admin user:</p>

              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium text-blue-800">
                    Method 1: Register normally, then update in Firebase Console
                  </h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm mt-2">
                    <li>Register a new account on the platform</li>
                    <li>
                      Go to{" "}
                      <a
                        href="https://console.firebase.google.com"
                        target="_blank"
                        className="text-blue-600 underline"
                        rel="noreferrer"
                      >
                        Firebase Console
                      </a>
                    </li>
                    <li>Navigate to Firestore Database</li>
                    <li>Find your user document in the "users" collection</li>
                    <li>
                      Edit the document and add field: <Badge className="bg-red-100 text-red-800">isAdmin: true</Badge>
                    </li>
                    <li>Save the changes</li>
                  </ol>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-medium text-green-800">Method 2: Use Firebase Admin SDK (Recommended)</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Create a user directly with admin privileges using the script provided.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Access Admin Panel */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-lg">Step 3: Access Admin Panel</h3>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm text-gray-600 mb-3">Once you have admin privileges:</p>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Log in to your admin account</li>
                <li>You'll see an "Admin" button in the header</li>
                <li>
                  Click it to access the admin panel at <Badge className="bg-purple-100 text-purple-800">/admin</Badge>
                </li>
                <li>
                  Or directly navigate to: <code className="bg-gray-100 px-2 py-1 rounded">yoursite.com/admin</code>
                </li>
              </ol>
            </div>
          </div>

          {/* Admin Features */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-indigo-600" />
              <h3 className="font-semibold text-lg">Admin Features Available</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-medium text-gray-800 mb-2">User Management</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• View all user profiles</li>
                  <li>• Ban/unban users</li>
                  <li>• Monitor user activity</li>
                  <li>• Access private profiles</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-medium text-gray-800 mb-2">Content Moderation</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Review swap requests</li>
                  <li>• Delete inappropriate content</li>
                  <li>• Monitor platform activity</li>
                  <li>• Track success rates</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-medium text-gray-800 mb-2">Communication</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Send platform announcements</li>
                  <li>• Feature updates</li>
                  <li>• Downtime alerts</li>
                  <li>• Emergency notifications</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-medium text-gray-800 mb-2">Analytics & Reports</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• User activity reports</li>
                  <li>• Swap statistics</li>
                  <li>• Feedback analytics</li>
                  <li>• Download detailed reports</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
