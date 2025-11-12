import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { userAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck, ArrowLeft } from 'lucide-react';

const VerifyUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUnverifiedUsers();
  }, []);

  const fetchUnverifiedUsers = async () => {
    try {
      const response = await userAPI.getUnverified();
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (username: string) => {
    try {
      await userAPI.verifyTrucker({ username });
      toast.success('User verified successfully!');
      setUsers(users.filter((user) => user.username !== username));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to verify user');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">User Verification</h1>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Verifications</CardTitle>
          <CardDescription>
            {users.length} user{users.length !== 1 ? 's' : ''} awaiting verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-semibold mb-2">All Users Verified</p>
              <p className="text-muted-foreground">
                There are no pending user verifications at this time.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.username}
                  className="p-4 rounded-lg border flex justify-between items-center hover:shadow-soft transition-smooth"
                >
                  <div>
                    <p className="font-semibold text-lg">{user.username}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    {user.firstName && user.lastName && (
                      <p className="text-sm text-muted-foreground">
                        {user.firstName} {user.lastName}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => handleVerify(user.username)}
                    className="gradient-primary text-white"
                  >
                    Accept
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyUsers;

