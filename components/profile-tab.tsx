"use client";

interface ProfileTabProps {
  user?: {
    id: string;
    email?: string;
    created_at: string;
    role?: string;
    user_metadata?: {
      username?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
}

export function ProfileTab({ user }: ProfileTabProps) {
  if (!user) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <p className="text-gray-500">No user data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">User Profile</h2>
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-gray-600">Username</label>
          <p className="text-lg">{user.user_metadata?.username}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Email</label>
          <p className="text-lg">{user.email}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">
            Member Since
          </label>
          <p className="text-lg">
            {new Date(user.created_at).toISOString().split("T")[0]}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Role</label>
          <p className="text-lg">{user.role || "N/A"}</p>
        </div>
      </div>

      {/* Raw User Data Display */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">
          Complete User Data (JSON)
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 overflow-auto">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
