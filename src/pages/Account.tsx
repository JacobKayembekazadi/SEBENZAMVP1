import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Calendar, 
  Shield, 
  Key, 
  Bell,
  CreditCard,
  Settings,
  Edit,
  Save,
  X,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Camera
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string;
  bio: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  company: {
    name: string;
    position: string;
    department: string;
  };
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    privacy: {
      profileVisible: boolean;
      showEmail: boolean;
      showPhone: boolean;
    };
    theme: string;
    language: string;
    timezone: string;
  };
  security: {
    twoFactorEnabled: boolean;
    lastLogin: Date;
    loginSessions: Array<{
      id: string;
      device: string;
      location: string;
      lastActive: Date;
      current: boolean;
    }>;
  };
  billing: {
    plan: string;
    status: string;
    nextBilling: Date;
    paymentMethod: string;
  };
}

const Account = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  
  const [profile, setProfile] = useState<UserProfile>({
    id: "1",
    firstName: "Jessica",
    lastName: "Chen",
    email: "jessica.chen@sebenza.law",
    phone: "+27 11 123 4567",
    role: "Senior Partner",
    bio: "Experienced senior partner specializing in corporate law and legal technology innovation.",
    address: {
      street: "123 Sandton Drive",
      city: "Johannesburg",
      state: "Gauteng",
      zipCode: "2196",
      country: "South Africa"
    },
    company: {
      name: "Sebenza Law Firm",
      position: "Senior Partner",
      department: "Corporate Law"
    },
    preferences: {
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      privacy: {
        profileVisible: true,
        showEmail: false,
        showPhone: false
      },
      theme: "light",
      language: "en",
      timezone: "Africa/Johannesburg"
    },
    security: {
      twoFactorEnabled: false,
      lastLogin: new Date(),
      loginSessions: [
        {
          id: "1",
          device: "Chrome on Windows",
          location: "Johannesburg, ZA",
          lastActive: new Date(),
          current: true
        },
        {
          id: "2",
          device: "Safari on iPhone",
          location: "Johannesburg, ZA",
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
          current: false
        }
      ]
    },
    billing: {
      plan: "Professional",
      status: "Active",
      nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      paymentMethod: "•••• •••• •••• 4532"
    }
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Load user profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        // In a real app, fetch from API
        // const data = await api.users.getProfile();
        // setProfile(data);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [toast]);

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      // In a real app, save to API
      // await api.users.updateProfile(profile);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate save
      
      setEditMode(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      // In a real app, call API
      // await api.users.changePassword(passwordForm);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowPasswordDialog(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast({
        title: "Password Changed",
        description: "Your password has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle2FA = async () => {
    try {
      setSaving(true);
      const newStatus = !profile.security.twoFactorEnabled;
      
      setProfile(prev => ({
        ...prev,
        security: {
          ...prev.security,
          twoFactorEnabled: newStatus
        }
      }));

      toast({
        title: newStatus ? "2FA Enabled" : "2FA Disabled",
        description: newStatus 
          ? "Two-factor authentication has been enabled for your account."
          : "Two-factor authentication has been disabled for your account.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update security settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEndSession = async (sessionId: string) => {
    try {
      setProfile(prev => ({
        ...prev,
        security: {
          ...prev.security,
          loginSessions: prev.security.loginSessions.filter(s => s.id !== sessionId)
        }
      }));

      toast({
        title: "Session Ended",
        description: "The session has been successfully terminated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to end session",
        variant: "destructive",
      });
    }
  };

  const handleProfileChange = (field: string, value: any) => {
    const keys = field.split('.');
    setProfile(prev => {
      let updated = { ...prev };
      let current: any = updated;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  if (loading) {
    return (
      <DashboardLayout title="My Account" description="Manage your account settings and preferences">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading account data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Account" description="Manage your account settings and preferences">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile.avatar} alt={`${profile.firstName} ${profile.lastName}`} />
                    <AvatarFallback className="text-lg">
                      {profile.firstName[0]}{profile.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
                  >
                    <Camera size={14} />
                  </Button>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {profile.firstName} {profile.lastName}
                  </h2>
                  <p className="text-gray-600">{profile.role}</p>
                  <p className="text-sm text-gray-500">{profile.company.name}</p>
                  <div className="flex items-center mt-2 space-x-4">
                    <Badge variant="secondary">{profile.billing.plan} Plan</Badge>
                    <Badge variant={profile.billing.status === 'Active' ? 'default' : 'destructive'}>
                      {profile.billing.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={editMode ? "secondary" : "default"}
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? (
                    <>
                      <X size={16} className="mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit size={16} className="mr-2" />
                      Edit Profile
                    </>
                  )}
                </Button>
                {editMode && (
                  <Button onClick={handleSaveProfile} disabled={saving}>
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} className="mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User size={20} className="mr-2" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>First Name</Label>
                      <Input
                        value={profile.firstName}
                        onChange={(e) => handleProfileChange('firstName', e.target.value)}
                        disabled={!editMode}
                      />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <Input
                        value={profile.lastName}
                        onChange={(e) => handleProfileChange('lastName', e.target.value)}
                        disabled={!editMode}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={profile.email}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      disabled={!editMode}
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={profile.phone}
                      onChange={(e) => handleProfileChange('phone', e.target.value)}
                      disabled={!editMode}
                    />
                  </div>
                  <div>
                    <Label>Bio</Label>
                    <Textarea
                      value={profile.bio}
                      onChange={(e) => handleProfileChange('bio', e.target.value)}
                      disabled={!editMode}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Address Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin size={20} className="mr-2" />
                    Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Street Address</Label>
                    <Input
                      value={profile.address.street}
                      onChange={(e) => handleProfileChange('address.street', e.target.value)}
                      disabled={!editMode}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>City</Label>
                      <Input
                        value={profile.address.city}
                        onChange={(e) => handleProfileChange('address.city', e.target.value)}
                        disabled={!editMode}
                      />
                    </div>
                    <div>
                      <Label>State/Province</Label>
                      <Input
                        value={profile.address.state}
                        onChange={(e) => handleProfileChange('address.state', e.target.value)}
                        disabled={!editMode}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>ZIP/Postal Code</Label>
                      <Input
                        value={profile.address.zipCode}
                        onChange={(e) => handleProfileChange('address.zipCode', e.target.value)}
                        disabled={!editMode}
                      />
                    </div>
                    <div>
                      <Label>Country</Label>
                      <Select
                        value={profile.address.country}
                        onValueChange={(value) => handleProfileChange('address.country', value)}
                        disabled={!editMode}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="South Africa">South Africa</SelectItem>
                          <SelectItem value="United States">United States</SelectItem>
                          <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                          <SelectItem value="Australia">Australia</SelectItem>
                          <SelectItem value="Canada">Canada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Company Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building size={20} className="mr-2" />
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Company Name</Label>
                    <Input
                      value={profile.company.name}
                      onChange={(e) => handleProfileChange('company.name', e.target.value)}
                      disabled={!editMode}
                    />
                  </div>
                  <div>
                    <Label>Position</Label>
                    <Input
                      value={profile.company.position}
                      onChange={(e) => handleProfileChange('company.position', e.target.value)}
                      disabled={!editMode}
                    />
                  </div>
                  <div>
                    <Label>Department</Label>
                    <Input
                      value={profile.company.department}
                      onChange={(e) => handleProfileChange('company.department', e.target.value)}
                      disabled={!editMode}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Password & Authentication */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Key size={20} className="mr-2" />
                    Password & Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Password</Label>
                      <p className="text-sm text-gray-500">Last changed 3 months ago</p>
                    </div>
                    <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Change Password
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Change Password</DialogTitle>
                          <DialogDescription>
                            Enter your current password and choose a new one.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Current Password</Label>
                            <div className="relative">
                              <Input
                                type={showPasswords.current ? "text" : "password"}
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm(prev => ({...prev, currentPassword: e.target.value}))}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                onClick={() => setShowPasswords(prev => ({...prev, current: !prev.current}))}
                              >
                                {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                              </Button>
                            </div>
                          </div>
                          <div>
                            <Label>New Password</Label>
                            <div className="relative">
                              <Input
                                type={showPasswords.new ? "text" : "password"}
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm(prev => ({...prev, newPassword: e.target.value}))}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                onClick={() => setShowPasswords(prev => ({...prev, new: !prev.new}))}
                              >
                                {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                              </Button>
                            </div>
                          </div>
                          <div>
                            <Label>Confirm New Password</Label>
                            <div className="relative">
                              <Input
                                type={showPasswords.confirm ? "text" : "password"}
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm(prev => ({...prev, confirmPassword: e.target.value}))}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                onClick={() => setShowPasswords(prev => ({...prev, confirm: !prev.confirm}))}
                              >
                                {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                              </Button>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleChangePassword} disabled={saving}>
                            {saving ? "Changing..." : "Change Password"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-500">
                        {profile.security.twoFactorEnabled ? "Enabled" : "Add extra security to your account"}
                      </p>
                    </div>
                    <Switch
                      checked={profile.security.twoFactorEnabled}
                      onCheckedChange={handleToggle2FA}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Active Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield size={20} className="mr-2" />
                    Active Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.security.loginSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{session.device}</p>
                        <p className="text-sm text-gray-500">{session.location}</p>
                        <p className="text-xs text-gray-400">
                          {session.current ? "Current session" : `Last active: ${session.lastActive.toLocaleString()}`}
                        </p>
                      </div>
                      {!session.current && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleEndSession(session.id)}
                        >
                          End Session
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell size={20} className="mr-2" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={profile.preferences.notifications.email}
                      onCheckedChange={(checked) => handleProfileChange('preferences.notifications.email', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-gray-500">Receive push notifications in browser</p>
                    </div>
                    <Switch
                      checked={profile.preferences.notifications.push}
                      onCheckedChange={(checked) => handleProfileChange('preferences.notifications.push', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-gray-500">Receive important alerts via SMS</p>
                    </div>
                    <Switch
                      checked={profile.preferences.notifications.sms}
                      onCheckedChange={(checked) => handleProfileChange('preferences.notifications.sms', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Privacy Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings size={20} className="mr-2" />
                    Privacy & Display
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Profile Visibility</Label>
                      <p className="text-sm text-gray-500">Make your profile visible to team members</p>
                    </div>
                    <Switch
                      checked={profile.preferences.privacy.profileVisible}
                      onCheckedChange={(checked) => handleProfileChange('preferences.privacy.profileVisible', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Email</Label>
                      <p className="text-sm text-gray-500">Display email in your profile</p>
                    </div>
                    <Switch
                      checked={profile.preferences.privacy.showEmail}
                      onCheckedChange={(checked) => handleProfileChange('preferences.privacy.showEmail', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Phone</Label>
                      <p className="text-sm text-gray-500">Display phone number in your profile</p>
                    </div>
                    <Switch
                      checked={profile.preferences.privacy.showPhone}
                      onCheckedChange={(checked) => handleProfileChange('preferences.privacy.showPhone', checked)}
                    />
                  </div>
                  <div>
                    <Label>Theme</Label>
                    <Select
                      value={profile.preferences.theme}
                      onValueChange={(value) => handleProfileChange('preferences.theme', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Language</Label>
                    <Select
                      value={profile.preferences.language}
                      onValueChange={(value) => handleProfileChange('preferences.language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="af">Afrikaans</SelectItem>
                        <SelectItem value="zu">isiZulu</SelectItem>
                        <SelectItem value="xh">isiXhosa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Timezone</Label>
                    <Select
                      value={profile.preferences.timezone}
                      onValueChange={(value) => handleProfileChange('preferences.timezone', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Africa/Johannesburg">South Africa (SAST)</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="Europe/London">GMT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Plan */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard size={20} className="mr-2" />
                    Current Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{profile.billing.plan} Plan</h3>
                      <p className="text-sm text-gray-500">R2,499/month</p>
                    </div>
                    <Badge variant={profile.billing.status === 'Active' ? 'default' : 'destructive'}>
                      {profile.billing.status}
                    </Badge>
                  </div>
                  <div>
                    <Label>Next Billing Date</Label>
                    <p className="text-sm">{profile.billing.nextBilling.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label>Payment Method</Label>
                    <p className="text-sm">{profile.billing.paymentMethod}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Change Plan
                    </Button>
                    <Button variant="outline" size="sm">
                      Update Payment
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Billing History */}
              <Card>
                <CardHeader>
                  <CardTitle>Billing History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Professional Plan</p>
                        <p className="text-sm text-gray-500">Jan 2025</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">R2,499.00</p>
                        <Button variant="ghost" size="sm" className="h-auto p-0 text-blue-600">
                          Download
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Professional Plan</p>
                        <p className="text-sm text-gray-500">Dec 2024</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">R2,499.00</p>
                        <Button variant="ghost" size="sm" className="h-auto p-0 text-blue-600">
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center">
              <AlertTriangle size={20} className="mr-2" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-red-600">Deactivate Account</Label>
                <p className="text-sm text-gray-500">Permanently deactivate your account and delete all data</p>
              </div>
              <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    Deactivate Account
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Deactivate Account</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete your account and remove all data.
                    </DialogDescription>
                  </DialogHeader>
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Are you sure you want to deactivate your account? All your data will be permanently deleted.
                    </AlertDescription>
                  </Alert>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowDeactivateDialog(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive">
                      Yes, Deactivate Account
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Account; 