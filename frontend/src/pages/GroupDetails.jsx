import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  fetchGroupDetails,
  fetchGroupMembers,
  fetchGroupPosts,
  createPost,
  fetchGroupChat,
  sendGroupMessage,
  fetchGroupJoinRequests,
  requestJoinGroup,
  removeGroupMember,
  approveGroupRequest
} from '../utils/api';
import RequestItem from '../components/RequestItem';

const GroupDetail = ({ currentUser }) => {
  const { groupName } = useParams();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const chatRef = useRef(null);

  // Join requests state
  const [joinRequests, setJoinRequests] = useState([]);
  const [userStatus, setUserStatus] = useState('not-member'); // can be 'not-member', 'pending', 'member'
  const [requestError, setRequestError] = useState(null);

  // Load group details
  useEffect(() => {
    const loadGroupData = async () => {
      try {
        setLoading(true);
        const groupData = await fetchGroupDetails(groupName, currentUser.username);
        setGroup(groupData);

        // Check if current user is admin
        const adminStatus = groupData.admin === currentUser.username;
        setIsAdmin(adminStatus);

        const membersData = await fetchGroupMembers(groupName);
        setMembers(membersData);

        // Check if current user is a member
        const isMember = membersData.some(member => member.username === currentUser.username);

        if (isMember) {
          setUserStatus('member');
          // Load posts
          const postsData = await fetchGroupPosts(groupName);
          setPosts(postsData);

          // Load chat
          const chatData = await fetchGroupChat(groupName);
          setChatMessages(chatData);
        } else {
          // For non-members, check if they have a pending request
          try {
            const requestsData = await fetchGroupJoinRequests(groupName);
            
            // Non-admin users can still check if they have their own pending request
            const hasPendingRequest = requestsData.some(
              request => request.username === currentUser.username && request.status === 'pending'
            );

            setUserStatus(hasPendingRequest ? 'pending' : 'not-member');

            // If user is admin, set all join requests
            if (adminStatus) {
              setJoinRequests(requestsData);
            }
          } catch (error) {
            console.log('Error fetching join requests:', error);
            // If error, they're probably not authorized to view requests
            setUserStatus('not-member');
          }
        }

        // If user is admin, always fetch join requests regardless of member status
        if (adminStatus) {
          try {
            const requestsData = await fetchGroupJoinRequests(groupName);
            setJoinRequests(requestsData);
          } catch (error) {
            console.log('Admin error fetching join requests:', error);
          }
        }
      } catch (error) {
        console.error('Error loading group data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGroupData();
  }, [groupName, currentUser.username]);

  // Set up periodic refresh for chat and requests
  useEffect(() => {
    // Set up interval to refresh chat
    const chatInterval = setInterval(() => {
      if (userStatus === 'member') {
        fetchGroupChat(groupName).then(data => {
          setChatMessages(data);
        }).catch(error => {
          console.log('Error refreshing chat:', error);
        });
      }
    }, 5000);

    // Set up interval to refresh join requests if admin
    const requestInterval = setInterval(() => {
      if (isAdmin) {
        fetchGroupJoinRequests(groupName)
          .then(requestsData => {
            setJoinRequests(requestsData);
          })
          .catch(error => {
            console.log('Error refreshing requests:', error);
          });
      }
    }, 10000);

    return () => {
      clearInterval(chatInterval);
      clearInterval(requestInterval);
    };
  }, [groupName, isAdmin, userStatus]);

  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    if (chatRef.current && activeTab === 'chat') {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages, activeTab]);

  // Handle join request
  const handleJoinRequest = async () => {
    try {
      setRequestError(null);
      const response = await requestJoinGroup(groupName, currentUser.username);
      if (response.status === 'success') {
        setUserStatus('pending');
      } else {
        setRequestError(response.message || 'Request failed');
      }
    } catch (error) {
      console.error('Error sending join request:', error);
      setRequestError('Failed to send join request');
    }
  };

  // Handle new post
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      await createPost(currentUser.username, newPost, groupName);
      const updatedPosts = await fetchGroupPosts(groupName);
      setPosts(updatedPosts);
      setNewPost('');
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  // Handle new chat message
  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await sendGroupMessage(groupName, currentUser.username, newMessage);
      const updatedChat = await fetchGroupChat(groupName);
      setChatMessages(updatedChat);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Refresh join requests
  const refreshRequests = async () => {
    try {
      const requestsData = await fetchGroupJoinRequests(groupName);
      setJoinRequests(requestsData);
      
      // Also refresh members after a request is processed
      const membersData = await fetchGroupMembers(groupName);
      setMembers(membersData);
      
      // Update the user's status if their request was processed
      const isMember = membersData.some(member => member.username === currentUser.username);
      if (isMember) {
        setUserStatus('member');
      } else {
        const hasPendingRequest = requestsData.some(
          request => request.username === currentUser.username && request.status === 'pending'
        );
        setUserStatus(hasPendingRequest ? 'pending' : 'not-member');
      }
    } catch (error) {
      console.error('Error refreshing requests:', error);
    }
  };

  // Handle member removal
  const handleRemoveMember = async (username) => {
    if (window.confirm(`Are you sure you want to remove ${username} from the group?`)) {
      try {
        await removeGroupMember(groupName, currentUser.username, username);
        // Refresh members list
        const updatedMembers = await fetchGroupMembers(groupName);
        setMembers(updatedMembers);
      } catch (error) {
        console.error('Error removing member:', error);
      }
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading group details...</div>;
  }

  if (!group) {
    return <div className="p-6 text-center">Group not found</div>;
  }

  return (
    <div className="p-6">
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{group.grpname}</h1>
          {userStatus === 'not-member' && (
            <button
              onClick={handleJoinRequest}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Request to Join
            </button>
          )}
          {userStatus === 'pending' && (
            <span className="px-4 py-2 bg-yellow-600 rounded-lg">Request Pending</span>
          )}
          {userStatus === 'member' && (
            <span className="px-4 py-2 bg-green-600 rounded-lg">Member</span>
          )}
        </div>
        <p className="text-gray-300">{group.description}</p>
        <p className="text-sm text-gray-400 mt-2">Admin: {group.admin}</p>
        {requestError && (
          <p className="text-red-500 text-sm mt-2">{requestError}</p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 ${activeTab === 'posts' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400'}`}
        >
          Posts
        </button>
        {userStatus === 'member' && (
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 ${activeTab === 'chat' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400'}`}
          >
            Group Chat
          </button>
        )}
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2 ${activeTab === 'members' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400'}`}
        >
          Members ({members.length})
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 ${activeTab === 'requests' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-400'}`}
          >
            Join Requests {joinRequests.filter(req => req.status === 'pending').length > 0 && `(${joinRequests.filter(req => req.status === 'pending').length})`}
          </button>
        )}
      </div>

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <div>
          {userStatus === 'member' && (
            <form onSubmit={handlePostSubmit} className="mb-6">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Write a post..."
                className="w-full p-3 bg-gray-700 rounded-lg resize-none"
                rows="3"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg mt-2"
              >
                Post
              </button>
            </form>
          )}

          {posts.length === 0 ? (
            <p className="text-center text-gray-400">No posts yet</p>
          ) : (
            <div>
              {posts.map(post => (
                <div key={post.id} className="bg-gray-800 p-4 rounded-lg mb-4">
                  <div className="flex items-center mb-2">
                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                      {post.username.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <Link to={`/profile/${post.username}`} className="font-semibold hover:underline">
                        {post.username}
                      </Link>
                      <p className="text-xs text-gray-400">
                        {new Date(post.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-200">{post.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Chat Tab */}
      {activeTab === 'chat' && userStatus === 'member' && (
        <div className="flex flex-col h-96">
          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto bg-gray-800 rounded-lg p-4 mb-4"
          >
            {chatMessages.length === 0 ? (
              <p className="text-center text-gray-400">No messages yet</p>
            ) : (
              chatMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`mb-4 ${msg.sender === currentUser.username ? 'text-right' : ''}`}
                >
                  <div
                    className={`inline-block p-3 rounded-lg max-w-3/4 ${
                      msg.sender === currentUser.username
                        ? 'bg-blue-600 text-left'
                        : 'bg-gray-700'
                    }`}
                  >
                    {msg.sender !== currentUser.username && (
                      <p className="font-semibold text-sm mb-1">{msg.sender}</p>
                    )}
                    <p>{msg.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(msg.time).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleMessageSubmit} className="flex">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 p-3 bg-gray-700 rounded-l-lg"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-r-lg"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div>
          {members.map(member => (
            <div key={member.username} className="bg-gray-800 p-4 rounded-lg mb-2 flex justify-between items-center">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                  {member.username.charAt(0)}
                </div>
                <div className="ml-3">
                  <Link to={`/profile/${member.username}`} className="font-semibold hover:underline">
                    {member.username}
                  </Link>
                  {member.username === group.admin && (
                    <span className="ml-2 px-2 py-0.5 bg-red-600 rounded-full text-xs">Admin</span>
                  )}
                </div>
              </div>

              {isAdmin && member.username !== currentUser.username && member.username !== group.admin && (
                <button
                  onClick={() => handleRemoveMember(member.username)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && isAdmin && (
        <div>
          <h2 className="text-xl font-bold mb-4">Pending Join Requests</h2>
          {joinRequests.filter(req => req.status === 'pending').length === 0 ? (
            <p className="text-center text-gray-400">No pending requests</p>
          ) : (
            joinRequests
              .filter(req => req.status === 'pending')
              .map(request => (
                <RequestItem
                  key={request.id}
                  request={{
                    ...request,
                    admin: group.admin // Make sure the admin is passed to RequestItem
                  }}
                  type="group"
                  onRequestUpdate={refreshRequests}
                  currentUser={currentUser}
                />
              ))
          )}
          
          <h2 className="text-xl font-bold mt-6 mb-4">Processed Requests</h2>
          {joinRequests.filter(req => req.status !== 'pending').length === 0 ? (
            <p className="text-center text-gray-400">No processed requests</p>
          ) : (
            joinRequests
              .filter(req => req.status !== 'pending')
              .map(request => (
                <RequestItem
                      key={request.id}
                      request={{
                        ...request,
                        admin: group.admin // This line is important
                      }}
                      type="group"
                      onRequestUpdate={refreshRequests}
                      currentUser={currentUser}
                    />
              ))
          )}
        </div>
      )}
    </div>
  );
};

export default GroupDetail;