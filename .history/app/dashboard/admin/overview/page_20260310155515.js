'use client';

import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [showDeactivatedModal, setShowDeactivatedModal] = useState(false);
  const [showRemovedModal, setShowRemovedModal] = useState(false);
  const [showKeptModal, setShowKeptModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [currentProfile, setCurrentProfile] = useState({});
  const [postToDelete, setPostToDelete] = useState(null);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/login");
      return;
    }
  

    if (session.user?.email !== "floresjamaicamae30@gmail.com") {
      router.push("/user/dashboard");
      return;
    }
  }, [session, status, router]);

  const handleImageError = (event) => {
    event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjNzI4QTlDIi8+CjxwYXRoIGQ9Ik03NSA0MEM4NS4zNzUgNDAgOTQgNDguNjI1IDk0IDU5Qzk0IDY5LjM3NSA4NS4zNzUgNzggNzUgNzhDNjQuNjI1IDc4IDU2IDY5LjM3NSA1NiA1OUM1NiA0OC42MjUgNjQuNjI1IDQwIDc1IDQwWk03NSAxMDBDODguMjUgMTAwIDEwMCAxMTEuNzUgMTAwIDEyNUg1MEM1MCAxMTEuNzUgNjEuNzUgMTAwIDc1IDEwMFoiIGZpbGw9IiNFRUVFRUUiLz4KPC9zdmc+';
  }

  const [deactivatedAccounts, setDeactivatedAccounts] = useState([
    {
      id: 1,
      fullName: 'John Smith',
      email: 'john.smith@example.com',
      phone: '+1 (555) 123-4567',
      profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
      deactivationDuration: '7 days'
    },
    {
      id: 2,
      fullName: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      phone: '+1 (555) 987-6543',
      profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
      deactivationDuration: '14 days'
    },
    {
      id: 3,
      fullName: 'Michael Brown',
      email: 'michael.b@example.com',
      phone: '+1 (555) 456-7890',
      profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
      deactivationDuration: '30 days'
    }
  ]);

  const [removedPosts] = useState([
    {
      id: 1,
      type: 'offer',
      skills: 'Illegal Software Services',
      description: 'Offering help with cracking software licenses and bypassing security measures.',
      category: 'Technology',
      location: 'Remote',
      skillsRequested: 'Graphic design services',
      schedule: 'ASAP',
      additionalNotes: 'Must be discreet about this service.',
      reportReason: 'Offering illegal services - software piracy and copyright infringement',
      userId: 1,
      userFullName: 'John Smith',
      userProfilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80'
    },
    {
      id: 2,
      type: 'request',
      request: 'Fake Certificate Creation',
      description: 'Need someone to create fake educational certificates for job applications.',
      category: 'Education',
      location: 'Remote',
      skillsOffered: 'Data entry work',
      schedule: 'Within 1 week',
      additionalNotes: 'Certificates need to look authentic and pass basic verification.',
      reportReason: 'Requesting fraudulent activity - creating fake educational documents',
      userId: 2,
      userFullName: 'Sarah Johnson',
      userProfilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80'
    },
    {
      id: 3,
      type: 'offer',
      skills: 'Academic Essay Writing (Plagiarism)',
      description: 'Offering to write academic essays and assignments with guaranteed plagiarism.',
      category: 'Education',
      location: 'Online',
      skillsRequested: 'Website development',
      schedule: 'Flexible deadlines',
      additionalNotes: 'Can handle any subject and academic level.',
      reportReason: 'Academic dishonesty - promoting plagiarism services',
      userId: 3,
      userFullName: 'Michael Brown',
      userProfilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80'
    }
  ]);

  // Sample data for kept posts
  const [keptPosts] = useState([
    {
      id: 1,
      type: 'offer',
      skills: 'Web Development & UI/UX Design',
      description: 'Experienced full-stack developer offering website development and design services for small businesses.',
      category: 'Technology',
      location: 'Remote',
      skillsRequested: 'Digital marketing, Content writing',
      schedule: 'Weekdays, 9 AM - 6 PM',
      additionalNotes: 'Portfolio available upon request. Free initial consultation.',
      reportReason: 'User reported as spam, but post appears legitimate',
      userId: 4,
      userFullName: 'Emily Davis',
      userProfilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80'
    },
    {
      id: 2,
      type: 'request',
      request: 'Need help with mobile app design',
      description: 'Looking for a designer to help create a mobile app interface for my startup focused on sustainability.',
      category: 'Design',
      location: 'Remote',
      skillsOffered: 'Backend development in Node.js',
      schedule: 'Within 3 weeks',
      additionalNotes: 'Experience with Figma preferred. Open to collaboration.',
      reportReason: 'Reported as inappropriate content, but post follows community guidelines',
      userId: 5,
      userFullName: 'David Wilson',
      userProfilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80'
    },
    {
      id: 3,
      type: 'offer',
      skills: 'Spanish & French Tutoring',
      description: 'Native Spanish speaker with fluent French offering language tutoring for all levels, from beginner to advanced.',
      category: 'Education',
      location: 'New York, NY',
      skillsRequested: 'English proofreading, Math tutoring',
      schedule: 'Weekends preferred, flexible timing',
      additionalNotes: 'Materials provided. First lesson free for new students.',
      reportReason: 'Reported for suspicious activity, but verified as legitimate service',
      userId: 6,
      userFullName: 'Maria Garcia',
      userProfilePicture: 'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80'
    }
  ]);

  // Sample profile data
  const sampleProfiles = {
    1: {
      userId: 1,
      fullName: 'John Smith',
      email: 'john.smith@example.com',
      phone: '+1 (555) 123-4567',
      userPicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
      isVerified: true,
      linkedAccounts: [
        { platform: 'LinkedIn', icon: 'work', url: 'https://linkedin.com/in/johnsmith' },
        { platform: 'GitHub', icon: 'code', url: 'https://github.com/johnsmith' }
      ],
      skillOffers: [
        {
          id: 101,
          skills: 'Web Development',
          description: 'Full-stack web development services using modern technologies.',
          category: 'Technology',
          location: 'Remote',
          skillsRequested: 'UI/UX Design',
          schedule: 'Flexible',
          timePosted: '2 days ago',
          additionalNotes: 'Available for long-term projects.',
          proof: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80'
        }
      ],
      skillRequests: [
        {
          id: 201,
          skills: 'Mobile App Design',
          description: 'Looking for a mobile app designer for my startup project.',
          category: 'Design',
          location: 'Remote',
          skillsOffered: 'Backend Development',
          schedule: 'Within 2 weeks',
          timePosted: '1 week ago',
          additionalNotes: 'Budget flexible for the right designer.'
        }
      ]
    },
    2: {
      userId: 2,
      fullName: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      phone: '+1 (555) 987-6543',
      userPicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
      isVerified: false,
      linkedAccounts: [
        { platform: 'Twitter', icon: 'flutter_dash', url: 'https://twitter.com/sarahj' }
      ],
      skillOffers: [
        {
          id: 102,
          skills: 'Graphic Design',
          description: 'Professional graphic design services for businesses and individuals.',
          category: 'Design',
          location: 'Remote',
          skillsRequested: 'Web Development',
          schedule: 'Weekdays',
          timePosted: '3 days ago',
          additionalNotes: 'Specializing in branding and logo design.'
        }
      ],
      skillRequests: []
    }
  };

  // Methods
  const reactivateAccount = (accountId) => {
    // Remove account from deactivated accounts
    setDeactivatedAccounts(deactivatedAccounts.filter(account => account.id !== accountId));
    // In a real application, you would make an API call here
    console.log(`Reactivated account with ID: ${accountId}`);
  };

  const openProfileModal = (userId) => {
    setCurrentProfile(sampleProfiles[userId] || {});
    setShowProfileModal(true);
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setCurrentProfile({});
  };

  const openDeleteModal = (post) => {
    setPostToDelete(post);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setPostToDelete(null);
  };

  const confirmDelete = () => {
    if (postToDelete) {
      // Remove the post from the current profile
      if (postToDelete.skills) {
        // It's a skill offer post
        setCurrentProfile(prev => ({
          ...prev,
          skillOffers: prev.skillOffers.filter(offer => offer.id !== postToDelete.id)
        }));
      } else {
        // It's a skill request post
        setCurrentProfile(prev => ({
          ...prev,
          skillRequests: prev.skillRequests.filter(request => request.id !== postToDelete.id)
        }));
      }
      console.log('Deleted post:', postToDelete);
    }
    closeDeleteModal();
  };

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading Admin Dashboard...</div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!session) {
    return null;
  }

  return (
    <div className="admin-dashboard max-w-6xl mx-auto p-4 sm:p-5 lg:p-6">
      {/* Admin Header with Session Info */}
      <div className="admin-header mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-[#121731] text-2xl sm:text-3xl font-semibold m-0">Admin Dashboard</h1>
            <p className="text-[#728a9c] text-sm sm:text-base mt-1">
              Welcome back, {session.user?.name || 'Admin'}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Container */}
      <div className="profile-container bg-white rounded-xl p-4 sm:p-5 shadow-md mb-6 sm:mb-8">
        <div className="profile-info flex items-center gap-3 sm:gap-4">
          {session?.user?.image ? (
            <img 
              src={session.user.image} 
              alt={session.user?.name || 'Admin'} 
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover"
              onError={handleImageError}
            />
          ) : (
            <span className="material-icons user-icon text-[#121731] text-4xl sm:text-5xl">admin_panel_settings</span>
          )}
          <div>
            <p className="admin-email text-base sm:text-lg font-medium text-[#121731] m-0">
              {session?.user?.email || 'admin@communitrade.com'}
            </p>
            <p className="admin-role text-sm text-[#728a9c] m-0 mt-1">
              Administrator
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Containers */}
      <div className="stats-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Deactivated Accounts */}
        <div className="stat-card deactivated-stat bg-white rounded-xl p-4 sm:p-6 shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="stat-header flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0 mb-4 sm:mb-5">
            <h3 className="text-[#121731] text-base sm:text-lg font-semibold m-0 flex-1 sm:mr-4">Total Number of Deactivated Accounts</h3>
            <button 
              className="see-all-btn bg-gradient-to-br from-[#121731] to-[#728a9c] text-white border-none px-3 sm:px-4 py-2 rounded-lg font-medium cursor-pointer text-xs sm:text-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg whitespace-nowrap w-full sm:w-auto text-center"
              onClick={() => setShowDeactivatedModal(true)}
            >
              See All
            </button>
          </div>
          <div className="stat-count text-4xl sm:text-5xl font-bold text-center text-[#e74c3c]">{deactivatedAccounts.length}</div>
        </div>

        {/* Removed Posts */}
        <div className="stat-card removed-stat bg-white rounded-xl p-4 sm:p-6 shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="stat-header flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0 mb-4 sm:mb-5">
            <h3 className="text-[#121731] text-base sm:text-lg font-semibold m-0 flex-1 sm:mr-4">Total Number of Removed Posts</h3>
            <button 
              className="see-all-btn bg-gradient-to-br from-[#121731] to-[#728a9c] text-white border-none px-3 sm:px-4 py-2 rounded-lg font-medium cursor-pointer text-xs sm:text-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg whitespace-nowrap w-full sm:w-auto text-center"
              onClick={() => setShowRemovedModal(true)}
            >
              See All
            </button>
          </div>
          <div className="stat-count text-4xl sm:text-5xl font-bold text-center text-[#e74c3c]">{removedPosts.length}</div>
        </div>

        {/* Kept Posts */}
        <div className="stat-card kept-stat bg-white rounded-xl p-4 sm:p-6 shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="stat-header flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0 mb-4 sm:mb-5">
            <h3 className="text-[#121731] text-base sm:text-lg font-semibold m-0 flex-1 sm:mr-4">Total Number of Kept Posts</h3>
            <button 
              className="see-all-btn bg-gradient-to-br from-[#121731] to-[#728a9c] text-white border-none px-3 sm:px-4 py-2 rounded-lg font-medium cursor-pointer text-xs sm:text-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg whitespace-nowrap w-full sm:w-auto text-center"
              onClick={() => setShowKeptModal(true)}
            >
              See All
            </button>
          </div>
          <div className="stat-count text-4xl sm:text-5xl font-bold text-center text-[#27ae60]">{keptPosts.length}</div>
        </div>
      </div>

      {/* Deactivated Accounts Modal */}
      {showDeactivatedModal && (
        <div 
          className="modal-overlay fixed inset-0 bg-[rgba(211,211,211,0.5)] backdrop-blur-[1px] flex justify-center items-start sm:items-center p-3 sm:p-4 lg:p-5 z-50 overflow-y-auto"
          onClick={() => setShowDeactivatedModal(false)}
        >
          <div 
            className="modal-content deactivated-modal bg-white rounded-xl w-full max-w-2xl my-4 sm:my-auto max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-xl">
              <h2 className="text-[#121731] m-0 text-xl sm:text-2xl">Deactivated Accounts</h2>
              <button 
                className="close-btn bg-none border-none cursor-pointer p-1 rounded-full transition-colors duration-300 hover:bg-gray-100"
                onClick={() => setShowDeactivatedModal(false)}
              >
                <span className="material-icons text-[#728a9c] text-xl sm:text-2xl">close</span>
              </button>
            </div>
            
            <div className="modal-body p-4 sm:p-6 lg:p-8">
              {deactivatedAccounts.map((account) => (
                <div key={account.id} className="account-item bg-gray-50 rounded-lg p-4 sm:p-5 mb-3 sm:mb-4 border border-gray-200 relative">
                  <div className="account-header flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <img src={account.profilePicture} alt={account.fullName} className="profile-picture w-12 h-12 sm:w-15 sm:h-15 rounded-full object-cover self-center sm:self-auto" onError={handleImageError} />
                    <div className="account-info flex-1 text-center sm:text-left">
                      <h4 className="account-name m-0 mb-1 text-[#121731] text-base sm:text-lg">{account.fullName}</h4>
                      <p className="account-email m-1 text-[#728a9c] text-xs sm:text-sm">{account.email}</p>
                      <p className="account-phone m-1 text-[#728a9c] text-xs sm:text-sm">{account.phone}</p>
                      <span className="deactivation-duration text-[#e74c3c] font-semibold text-xs sm:text-sm">Deactivated for: {account.deactivationDuration}</span>
                    </div>
                    <button 
                      className="reactivate-btn bg-gradient-to-r from-[#27ae60] via-[#2ecc71] to-[#27ae60] text-white border-none px-3 py-1.5 rounded-md font-medium cursor-pointer text-xs sm:text-sm transition-all duration-300 sm:absolute sm:top-4 sm:right-4 mt-2 sm:mt-0 w-full sm:w-auto text-center hover:from-[#2ecc71] hover:to-[#219653] hover:shadow-[0_0_6px_rgba(39,174,96,0.4)] hover:-translate-y-0.5"
                      onClick={() => reactivateAccount(account.id)}
                    >
                      Reactivate Account
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Removed Posts Modal */}
      {showRemovedModal && (
        <div 
          className="modal-overlay fixed inset-0 bg-[rgba(211,211,211,0.5)] backdrop-blur-[1px] flex justify-center items-start sm:items-center p-3 sm:p-4 lg:p-5 z-50 overflow-y-auto"
          onClick={() => setShowRemovedModal(false)}
        >
          <div 
            className="modal-content removed-modal bg-white rounded-xl w-full max-w-3xl my-4 sm:my-auto max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-xl">
              <h2 className="text-[#121731] m-0 text-xl sm:text-2xl">Removed Posts</h2>
              <button 
                className="close-btn bg-none border-none cursor-pointer p-1 rounded-full transition-colors duration-300 hover:bg-gray-100"
                onClick={() => setShowRemovedModal(false)}
              >
                <span className="material-icons text-[#728a9c] text-xl sm:text-2xl">close</span>
              </button>
            </div>
            
            <div className="modal-body p-4 sm:p-6 lg:p-8">
              {removedPosts.map((post) => (
                <div key={post.id} className="post-item bg-gray-50 rounded-lg p-4 sm:p-5 mb-4 sm:mb-5 border border-gray-200">
                  <div className="post-header-user flex flex-col sm:flex-row sm:items-center gap-3 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <img src={post.userProfilePicture} alt={post.userFullName} className="user-profile-picture w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover" onError={handleImageError} />
                      <div className="user-info flex-1">
                        <h4 className="user-name m-0 text-[#121731] text-sm sm:text-base font-semibold">{post.userFullName}</h4>
                      </div>
                    </div>
                    <button 
                      className="view-profile-btn bg-gradient-to-br from-[#121731] to-[#728a9c] text-white border-none px-3 py-1.5 rounded font-medium cursor-pointer text-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md whitespace-nowrap w-full sm:w-auto text-center mt-2 sm:mt-0"
                      onClick={() => openProfileModal(post.userId)}
                    >
                      View Profile
                    </button>
                  </div>
                  
                  <div className={`post-type-badge inline-block px-2 py-1 rounded-full text-xs font-semibold mb-3 sm:mb-4 ${post.type === 'offer' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                    {post.type === 'offer' ? 'Offer Post' : 'Request Post'}
                  </div>
                  
                  <div className="post-content">
                    {/* Offer Post Content */}
                    {post.type === 'offer' ? (
                      <div>
                        <h4 className="post-title m-0 mb-2 text-[#121731] text-base sm:text-lg font-semibold">{post.skills}</h4>
                        <p className="post-description m-0 mb-3 sm:mb-4 text-gray-600 leading-relaxed text-sm sm:text-base">{post.description}</p>
                        
                        <div className="post-details grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-2.5 mb-3 sm:mb-4">
                          <div className="detail-item flex flex-col">
                            <span className="detail-label font-semibold text-[#121731] mb-1 text-xs sm:text-sm">Category:</span>
                            <span className="detail-value text-gray-600 text-xs sm:text-sm">{post.category}</span>
                          </div>
                          <div className="detail-item flex flex-col">
                            <span className="detail-label font-semibold text-[#121731] mb-1 text-xs sm:text-sm">Location:</span>
                            <span className="detail-value text-gray-600 text-xs sm:text-sm">{post.location}</span>
                          </div>
                          <div className="detail-item flex flex-col">
                            <span className="detail-label font-semibold text-[#121731] mb-1 text-xs sm:text-sm">Skills Requested:</span>
                            <span className="detail-value text-gray-600 text-xs sm:text-sm">{post.skillsRequested}</span>
                          </div>
                          <div className="detail-item flex flex-col">
                            <span className="detail-label font-semibold text-[#121731] mb-1 text-xs sm:text-sm">Schedule:</span>
                            <span className="detail-value text-gray-600 text-xs sm:text-sm">{post.schedule}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Request Post Content
                      <div>
                        <h4 className="post-title m-0 mb-2 text-[#121731] text-base sm:text-lg font-semibold">{post.request}</h4>
                        <p className="post-description m-0 mb-3 sm:mb-4 text-gray-600 leading-relaxed text-sm sm:text-base">{post.description}</p>
                        
                        <div className="post-details grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-2.5 mb-3 sm:mb-4">
                          <div className="detail-item flex flex-col">
                            <span className="detail-label font-semibold text-[#121731] mb-1 text-xs sm:text-sm">Category:</span>
                            <span className="detail-value text-gray-600 text-xs sm:text-sm">{post.category}</span>
                          </div>
                          <div className="detail-item flex flex-col">
                            <span className="detail-label font-semibold text-[#121731] mb-1 text-xs sm:text-sm">Location:</span>
                            <span className="detail-value text-gray-600 text-xs sm:text-sm">{post.location}</span>
                          </div>
                          <div className="detail-item flex flex-col">
                            <span className="detail-label font-semibold text-[#121731] mb-1 text-xs sm:text-sm">Skills Offered:</span>
                            <span className="detail-value text-gray-600 text-xs sm:text-sm">{post.skillsOffered}</span>
                          </div>
                          <div className="detail-item flex flex-col">
                            <span className="detail-label font-semibold text-[#121731] mb-1 text-xs sm:text-sm">Schedule:</span>
                            <span className="detail-value text-gray-600 text-xs sm:text-sm">{post.schedule}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {post.additionalNotes && (
                      <div className="additional-notes mb-3 sm:mb-4 rounded">
                        <span className="detail-label font-semibold text-[#121731] text-xs sm:text-sm">Additional Notes:</span>
                        <p className="detail-value text-gray-600 text-xs sm:text-sm">{post.additionalNotes}</p>
                      </div>
                    )}
                    
                    <div className="report-reason px-3 py-2 sm:py-3 bg-yellow-100 border border-yellow-300 rounded text-yellow-800">
                      <span className="detail-label font-bold text-yellow-800 text-xs sm:text-sm">Reason for Report:</span>
                      <p className="detail-value text-yellow-800 text-xs sm:text-sm">{post.reportReason}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Kept Posts Modal */}
      {showKeptModal && (
        <div 
          className="modal-overlay fixed inset-0 bg-[rgba(211,211,211,0.5)] backdrop-blur-[1px] flex justify-center items-start sm:items-center p-3 sm:p-4 lg:p-5 z-50 overflow-y-auto"
          onClick={() => setShowKeptModal(false)}
        >
          <div 
            className="modal-content kept-modal bg-white rounded-xl w-full max-w-3xl my-4 sm:my-auto max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-xl">
              <h2 className="text-[#121731] m-0 text-xl sm:text-2xl">Kept Posts</h2>
              <button 
                className="close-btn bg-none border-none cursor-pointer p-1 rounded-full transition-colors duration-300 hover:bg-gray-100"
                onClick={() => setShowKeptModal(false)}
              >
                <span className="material-icons text-[#728a9c] text-xl sm:text-2xl">close</span>
              </button>
            </div>
            
            <div className="modal-body p-4 sm:p-6 lg:p-8">
              {keptPosts.map((post) => (
                <div key={post.id} className="post-item bg-gray-50 rounded-lg p-4 sm:p-5 mb-4 sm:mb-5 border border-gray-200">
                  <div className="post-header-user flex flex-col sm:flex-row sm:items-center gap-3 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <img src={post.userProfilePicture} alt={post.userFullName} className="user-profile-picture w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover" onError={handleImageError} />
                      <div className="user-info flex-1">
                        <h4 className="user-name m-0 text-[#121731] text-sm sm:text-base font-semibold">{post.userFullName}</h4>
                      </div>
                    </div>
                    <button 
                      className="view-profile-btn bg-gradient-to-br from-[#121731] to-[#728a9c] text-white border-none px-3 py-1.5 rounded font-medium cursor-pointer text-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md whitespace-nowrap w-full sm:w-auto text-center mt-2 sm:mt-0"
                      onClick={() => openProfileModal(post.userId)}
                    >
                      View Profile
                    </button>
                  </div>
                  
                  <div className={`post-type-badge inline-block px-2 py-1 rounded-full text-xs font-semibold mb-3 sm:mb-4 ${post.type === 'offer' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                    {post.type === 'offer' ? 'Offer Post' : 'Request Post'}
                  </div>
                  
                  <div className="post-content">
                    {/* Offer Post Content */}
                    {post.type === 'offer' ? (
                      <div>
                        <h4 className="post-title m-0 mb-2 text-[#121731] text-base sm:text-lg font-semibold">{post.skills}</h4>
                        <p className="post-description m-0 mb-3 sm:mb-4 text-gray-600 leading-relaxed text-sm sm:text-base">{post.description}</p>
                        
                        <div className="post-details grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-2.5 mb-3 sm:mb-4">
                          <div className="detail-item flex flex-col">
                            <span className="detail-label font-semibold text-[#121731] mb-1 text-xs sm:text-sm">Category:</span>
                            <span className="detail-value text-gray-600 text-xs sm:text-sm">{post.category}</span>
                          </div>
                          <div className="detail-item flex flex-col">
                            <span className="detail-label font-semibold text-[#121731] mb-1 text-xs sm:text-sm">Location:</span>
                            <span className="detail-value text-gray-600 text-xs sm:text-sm">{post.location}</span>
                          </div>
                          <div className="detail-item flex flex-col">
                            <span className="detail-label font-semibold text-[#121731] mb-1 text-xs sm:text-sm">Skills Requested:</span>
                            <span className="detail-value text-gray-600 text-xs sm:text-sm">{post.skillsRequested}</span>
                          </div>
                          <div className="detail-item flex flex-col">
                            <span className="detail-label font-semibold text-[#121731] mb-1 text-xs sm:text-sm">Schedule:</span>
                            <span className="detail-value text-gray-600 text-xs sm:text-sm">{post.schedule}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Request Post Content
                      <div>
                        <h4 className="post-title m-0 mb-2 text-[#121731] text-base sm:text-lg font-semibold">{post.request}</h4>
                        <p className="post-description m-0 mb-3 sm:mb-4 text-gray-600 leading-relaxed text-sm sm:text-base">{post.description}</p>
                        
                        <div className="post-details grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-2.5 mb-3 sm:mb-4">
                          <div className="detail-item flex flex-col">
                            <span className="detail-label font-semibold text-[#121731] mb-1 text-xs sm:text-sm">Category:</span>
                            <span className="detail-value text-gray-600 text-xs sm:text-sm">{post.category}</span>
                          </div>
                          <div className="detail-item flex flex-col">
                            <span className="detail-label font-semibold text-[#121731] mb-1 text-xs sm:text-sm">Location:</span>
                            <span className="detail-value text-gray-600 text-xs sm:text-sm">{post.location}</span>
                          </div>
                          <div className="detail-item flex flex-col">
                            <span className="detail-label font-semibold text-[#121731] mb-1 text-xs sm:text-sm">Skills Offered:</span>
                            <span className="detail-value text-gray-600 text-xs sm:text-sm">{post.skillsOffered}</span>
                          </div>
                          <div className="detail-item flex flex-col">
                            <span className="detail-label font-semibold text-[#121731] mb-1 text-xs sm:text-sm">Schedule:</span>
                            <span className="detail-value text-gray-600 text-xs sm:text-sm">{post.schedule}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {post.additionalNotes && (
                      <div className="additional-notes mb-3 sm:mb-4 rounded">
                        <span className="detail-label font-semibold text-[#121731] text-xs sm:text-sm">Additional Notes:</span>
                        <p className="detail-value text-gray-600 text-xs sm:text-sm">{post.additionalNotes}</p>
                      </div>
                    )}
                    
                    <div className="report-reason px-3 py-2 sm:py-3 bg-yellow-100 border border-yellow-300 rounded text-yellow-800">
                      <span className="detail-label font-bold text-yellow-800 text-xs sm:text-sm">Reason for Report:</span>
                      <p className="detail-value text-yellow-800 text-xs sm:text-sm">{post.reportReason}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div 
          className="modal-overlay profile-overlay fixed inset-0 bg-[rgba(211,211,211,0.5)] backdrop-blur-[1px] flex justify-center items-center p-3 sm:p-4 lg:p-5 z-50 overflow-y-auto"
          onClick={closeProfileModal}
        >
          <div 
            className="modal-content profile-modal bg-white rounded-xl max-w-2xl w-full p-4 sm:p-6 shadow-lg flex flex-col max-h-[85vh] overflow-y-auto relative my-4 sm:my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="profile-header flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 border-b border-gray-300 pb-4 sm:pb-5 mb-4 sm:mb-5">
              <img src={currentProfile.userPicture} alt={currentProfile.fullName} className="profile-picture w-20 h-20 sm:w-25 sm:h-25 rounded-full object-cover self-center sm:self-auto" onError={handleImageError} />
              <div className="profile-info flex flex-col gap-1 items-center sm:items-start text-center sm:text-left">
                <div className="name-verified flex flex-col sm:flex-row items-center gap-2.5 mb-2">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 m-0">{currentProfile.fullName}</h2>
                  {currentProfile.isVerified && (
                    <span className="verified-badge flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium mt-1 sm:mt-0">
                      <span className="material-icons text-lg mr-0.5">verified</span>
                      Verified
                    </span>
                  )}
                </div>
                <p className="profile-email m-0 text-[#728a9c] flex items-center gap-2 pl-0 text-sm sm:text-base">{currentProfile.email}</p>
                <p className="profile-phone m-0 text-[#728a9c] flex items-center gap-2 pl-0 text-sm sm:text-base">{currentProfile.phone}</p>
              </div>
            </div>

            <div className="profile-sections flex flex-col gap-4 sm:gap-6">
              {/* Linked Accounts Section */}
              <div className="profile-section">
                <h3 className="text-[#121731] text-lg sm:text-xl m-0 mb-3 sm:mb-4">Linked Accounts</h3>
                <div className="linked-accounts flex flex-col gap-2 sm:gap-2.5">
                  {currentProfile.linkedAccounts?.map((account) => (
                    <a 
                      key={account.platform}
                      href={account.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="account-item flex items-center gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg no-underline text-inherit transition-colors duration-300 hover:bg-gray-200"
                    >
                      <span className="material-icons account-icon text-[#121731] text-lg sm:text-xl">{account.icon}</span>
                      <span className="account-platform flex-1 font-medium text-sm sm:text-base">{account.platform}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Skill Offer Posts Section */}
              <div className="profile-section">
                <h3 className="text-[#121731] text-lg sm:text-xl m-0 mb-3 sm:mb-4">Skill Offer Posts</h3>
                <div className="posts-list flex flex-col gap-4 sm:gap-5">
                  {currentProfile.skillOffers?.map((offer) => (
                    <div key={offer.id} className="profile-post-card bg-gray-50 rounded-lg p-3 sm:p-4 lg:p-5 border border-gray-200">
                      <div className="post-header flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0 mb-2 sm:mb-3">
                        <h4 className="m-0 text-[#121731] flex-1 text-base sm:text-lg">{offer.skills}</h4>
                        <span className="post-time text-[#728a9c] text-xs sm:text-sm">{offer.timePosted}</span>
                      </div>
                      <p className="post-description m-0 mb-3 sm:mb-4 text-gray-600 leading-relaxed text-sm sm:text-base">{offer.description}</p>
                      <div className="post-details grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-2.5 mb-3 sm:mb-4">
                        <div className="detail-item flex flex-col">
                          <span className="detail-label font-semibold text-[#121731] mb-1 text-xs sm:text-sm">Category:</span>
                          <span className="detail-value text-gray-600 text-xs sm:text-sm">{offer.category}</span>
                        </div>
                        <div className="detail-item flex flex-col">
                          <span className="detail-label font-semibold text-[#121731] mb-1 text-xs sm:text-sm">Location:</span>
                          <span className="detail-value text-gray-600 text-xs sm:text-sm">{offer.location}</span>
                        </div>
                        <div className="detail-item flex flex-col">
                          <span className="detail-label font-semibold text-[#121731] mb-1 text-xs sm:text-sm">Skills Requested:</span>
                          <span className="detail-value text-gray-600 text-xs sm:text-sm">{offer.skillsRequested}</span>
                        </div>
                        <div className="detail-item flex flex-col">
                          <span className="detail-label font-semibold text-[#121731] mb-1 text-xs sm:text-sm">Schedule:</span>
                          <span className="detail-value text-gray-600 text-xs sm:text-sm">{offer.schedule}</span>
                        </div>
                      </div>
                      {offer.additionalNotes && (
                        <div className="additional-notes mb-3 sm:mb-4">
                          <span className="detail-label font-semibold text-[#121731] text-xs sm:text-sm">Additional Notes:</span>
                          <p className="detail-value text-gray-600 text-xs sm:text-sm">{offer.additionalNotes}</p>
                        </div>
                      )}
                      {offer.proof && (
                        <div className="proof-image my-3 sm:my-4">
                          <img src={offer.proof} alt="Proof" className="proof-thumbnail w-full max-w-40 sm:max-w-50 rounded-lg border border-gray-300" onError={handleImageError} />
                        </div>
                      )}
                      <div className="post-actions flex flex-col xs:flex-row gap-2 sm:gap-2.5 mt-3 sm:mt-4">
                        <button 
                          className="btn delete-btn flex items-center justify-center px-3 py-1.5 rounded-lg font-medium transition-all duration-300 text-red-600 border border-red-600 hover:bg-red-600 hover:text-white text-xs sm:text-sm"
                          onClick={() => openDeleteModal(offer)}
                        >
                          <span className="material-icons text-base mr-1">delete</span>
                          Delete
                        </button>

                        <button 
                          className="btn contact-btn flex items-center justify-center px-3 py-1.5 rounded-lg font-medium transition-all duration-300 text-[#121731] border border-[#121731] hover:bg-[#121731] hover:text-white text-xs sm:text-sm"
                        >
                          <span className="material-icons text-base mr-1">message</span>
                          Contact
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skill Request Posts Section */}
              <div className="profile-section">
                <h3 className="text-[#121731] text-lg sm:text-xl m-0 mb-3 sm:mb-4">Skill Request Posts</h3>
                <div className="posts-list flex flex-col gap-4 sm:gap-5">
                  {currentProfile.skillRequests?.map((request) => (
                    <div key={request.id} className="profile-post-card bg-gray-50 rounded-lg p-3 sm:p-4 lg:p-5 border border-gray-200">
                      <div className="post-header flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0 mb-2 sm:mb-3">
                        <h4 className="m-0 text-[#121731] flex-1 text-base sm:text-lg">{request.request}</h4>
                        <span className="post-time text-[#728a9c] text-xs sm:text-sm">{request.timePosted}</span>
                      </div>
                      <p className="post-description m-0 mb-3 sm:mb-4 text-gray-600 leading-relaxed text-sm sm:text-base">{request.description}</p>
                      <div className="post-details grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-2.5 mb-3 sm:mb-4">
                        <div className="detail-item flex flex-col">
                          <span className="detail-label font-semibold text-[#121731] mb-1 text-xs sm:text-sm">Category:</span>
                          <span className="detail-value text-gray-600 text-xs sm:text-sm">{request.category}</span>
                        </div>
                        <div className="detail-item flex flex-col">
                          <span className="detail-label font-semibold text-[#121731] mb-1 text-xs sm:text-sm">Location:</span>
                          <span className="detail-value text-gray-600 text-xs sm:text-sm">{request.location}</span>
                        </div>
                        <div className="detail-item flex flex-col">
                          <span className="detail-label font-semibold text-[#121731] mb-1 text-xs sm:text-sm">Skills Offered:</span>
                          <span className="detail-value text-gray-600 text-xs sm:text-sm">{request.skillsOffered}</span>
                        </div>
                        <div className="detail-item flex flex-col">
                          <span className="detail-label font-semibold text-[#121731] mb-1 text-xs sm:text-sm">Schedule:</span>
                          <span className="detail-value text-gray-600 text-xs sm:text-sm">{request.schedule}</span>
                        </div>
                      </div>
                      {request.additionalNotes && (
                        <div className="additional-notes mb-3 sm:mb-4">
                          <span className="detail-label font-semibold text-[#121731] text-xs sm:text-sm">Additional Notes:</span>
                          <p className="detail-value text-gray-600 text-xs sm:text-sm">{request.additionalNotes}</p>
                        </div>
                      )}
                      {request.proof && (
                        <div className="proof-image my-3 sm:my-4">
                          <img src={request.proof} alt="Proof" className="proof-thumbnail w-full max-w-40 sm:max-w-50 rounded-lg border border-gray-300" onError={handleImageError} />
                        </div>
                      )}
                      <div className="post-actions flex flex-col xs:flex-row gap-2 sm:gap-2.5 mt-3 sm:mt-4">
                        <button 
                          className="btn delete-btn flex items-center justify-center px-3 py-1.5 rounded font-medium text-xs sm:text-sm transition-all duration-300 text-[#e74c3c] border border-[#e74c3c] hover:bg-[#e74c3c] hover:text-white"
                          onClick={() => openDeleteModal(request)}
                        >
                          <span className="material-icons text-base mr-1">delete</span>
                          Delete
                        </button>
                        <button className="btn contact-btn flex items-center justify-center px-3 py-1.5 rounded font-medium text-xs sm:text-sm transition-all duration-300 text-[#121731] border border-[#121731] hover:bg-[#121731] hover:text-white">
                          <span className="material-icons text-base mr-1">message</span>
                          Contact
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="profile-actions1 flex justify-end mt-6 sm:mt-8 pt-4 sm:pt-5 border-t border-gray-200">
              <button 
                className="close-btn1 px-4 sm:px-5 py-2 bg-[#121731] text-white border-none rounded-lg cursor-pointer transition-colors duration-300 hover:bg-[#728a9c] text-sm sm:text-base"
                onClick={closeProfileModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div 
          className="modal-overlay fixed inset-0 bg-[rgba(211,211,211,0.5)] backdrop-blur-[1px] flex justify-center items-center p-3 sm:p-4 lg:p-5 z-50 overflow-y-auto"
          onClick={closeDeleteModal}
        >
          <div 
            className="modal-content delete-modal bg-white rounded-xl max-w-md w-full p-4 sm:p-6 lg:p-8 shadow-2xl my-4 sm:my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="delete-header mb-4 sm:mb-6 text-center">
              <h2 className="text-[#121731] m-0 text-xl sm:text-2xl">Delete Post</h2>
            </div>
            
            <div className="delete-content mb-6 sm:mb-8 text-center">
              <div className="delete-warning-icon mb-3 sm:mb-4">
                <span className="material-icons text-4xl sm:text-5xl text-[#e74c3c]">warning</span>
              </div>
              <p className="delete-warning text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
                Are you sure you want to delete this post?
              </p>
              <p className="delete-info text-[#728a9c] leading-relaxed mb-0 text-sm sm:text-base">
                This action cannot be undone. The post will be permanently removed.
              </p>
            </div>
            
            <div className="delete-actions flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button 
                className="btn confirm-delete-btn px-4 py-2 bg-red-600 text-white border-none rounded-lg cursor-pointer transition-colors duration-300 hover:bg-red-700" 
                onClick={confirmDelete}
              >
                Confirm Delete
              </button>
              <button 
                className="btn cancel-btn px-4 py-2 border border-[#728a9c] text-[#728a9c] rounded-lg cursor-pointer transition-colors duration-300 hover:bg-[#b7c8d4] hover:text-white" 
                onClick={closeDeleteModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}