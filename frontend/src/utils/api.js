  // src/utils/api.js
  const API_BASE_URL = 'http://localhost:8000';

  const handleResponse = async (response, errorMessage) => {
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json(); // Attempt to get JSON error message
      } catch (jsonError) {
        // If JSON parsing fails, use the raw text
        throw new Error(`${errorMessage}. Status: ${response.status}, Text: ${await response.text()}`);
      }
      // If we successfully parsed JSON, include it in the error
      throw new Error(`${errorMessage}. Status: ${response.status}, Details: ${JSON.stringify(errorData)}`);
    }
    return response.json();
  };

  export const fetchFeed = async (username) => {
    const response = await fetch(`${API_BASE_URL}/feed/${username}`);
    return handleResponse(response, 'Failed to fetch feed');
  };

  export const fetchUserProfile = async (username) => {
    const response = await fetch(`${API_BASE_URL}/user/${username}`);
    return handleResponse(response, 'Failed to fetch user profile');
  };

  export const createUser = async (userData) => {
    const formData = new FormData();
    
    // Handle each field separately to properly handle null values
    Object.keys(userData).forEach(key => {
      // Only append if value is not null or undefined
      if (userData[key] != null) {
        formData.append(key, userData[key]);
      }
    });

    const response = await fetch(`${API_BASE_URL}/new_user`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response, 'Failed to create user');
  };

  export const createTweet = async ({ username, content, photo }) => {
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('content', content);
      
      // Only append photo if it exists
      if (photo) {
        formData.append('photo', photo);
      }
      
      const response = await fetch(`${API_BASE_URL}/new_tweet`, {
        method: 'POST',
        body: formData,
      });
      
      return handleResponse(response, 'Failed to create tweet');
    } catch (error) {
      console.error('Error creating tweet:', error);
      throw error;
    }
  };

  export const deleteTweet = async (tweetId) => {
    const response = await fetch(`${API_BASE_URL}/delete_tweet/${tweetId}`);
    return handleResponse(response, 'Failed to delete tweet');
  };

  export const fetchTweet = async (tweetId) => {
    const response = await fetch(`${API_BASE_URL}/full_tweet/${tweetId}`);
    return handleResponse(response, 'Failed to fetch tweet');
  };

  export const likeTweet = async (tweetId, userId) => {
    const formData = new FormData();
    formData.append('tweet_id', tweetId);
    formData.append('user_id', userId);

    const response = await fetch(`${API_BASE_URL}/new_like`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response, 'Failed to like tweet');
  };

  export const unlikeTweet = async (tweetId, userId) => {
    const formData = new FormData();
    formData.append('tweet_id', tweetId);
    formData.append('user_id', userId);

    const response = await fetch(`${API_BASE_URL}/new_unlike`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response, 'Failed to unlike tweet');
  };

  export const addComment = async (tweetId, username, content) => {
    const formData = new FormData();
    formData.append('tweet_id', tweetId);
    formData.append('username', username);
    formData.append('content', content);

    const response = await fetch(`${API_BASE_URL}/new_comment`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response, 'Failed to add comment');
  };

  export const deleteComment = async (commentId) => {
    const response = await fetch(`${API_BASE_URL}/delete_comment/${commentId}`);
    return handleResponse(response, 'Failed to delete comment');
  };

  export const followUser = async (currentUser, targetUser) => {
    // Make sure currentUser is treated as a string
    const currentUserString = typeof currentUser === 'object' ? 
      (currentUser.username || String(currentUser)) : 
      String(currentUser);
    
    const response = await fetch(`${API_BASE_URL}/new_follow?curuser=${currentUserString}&user=${targetUser}`);
    return handleResponse(response, 'Failed to follow user');
  };

  export const unfollowUser = async (currentUser, targetUser) => {
    const response = await fetch(`${API_BASE_URL}/new_unfollow?curuser=${currentUser}&user=${targetUser}`);
    return handleResponse(response, 'Failed to unfollow user');
  };

  export const isFollowing = async (currentUser, targetUser) => {
    const response = await fetch(`${API_BASE_URL}/is_following?curuser=${currentUser}&user=${targetUser}`);
    return handleResponse(response, 'Failed to check follow status');
  };

  export const createPoll = async (pollData) => {
    const formData = new FormData();
    
    // Handle each field separately
    Object.keys(pollData).forEach(key => {
      // Only append if value is not null or undefined
      if (pollData[key] != null) {
        formData.append(key, pollData[key]);
      }
    });

    const response = await fetch(`${API_BASE_URL}/new_poll`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response, 'Failed to create poll');
  };

  export const fetchPoll = async (pollId) => {
    const response = await fetch(`${API_BASE_URL}/poll/${pollId}`);
    return handleResponse(response, 'Failed to fetch poll');
  };

  export const castVote = async (username, pollId, option) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('poll_id', pollId);
    formData.append('option', option);

    const response = await fetch(`${API_BASE_URL}/cast_vote`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response, 'Failed to cast vote');
  };

  export const fetchPollFeed = async () => {
    const response = await fetch(`${API_BASE_URL}/poll_feed`);
    return handleResponse(response, 'Failed to fetch poll feed');
  };

  export const deletePoll = async (pollId) => {
    const response = await fetch(`${API_BASE_URL}/delete_poll/${pollId}`);
    return handleResponse(response, 'Failed to delete poll');
  };

  export const createGroup = async (groupData) => {
    const formData = new FormData();
    
    // Handle each field separately
    Object.keys(groupData).forEach(key => {
      // Only append if value is not null or undefined
      if (groupData[key] != null) {
        formData.append(key, groupData[key]);
      }
    });

    const response = await fetch(`${API_BASE_URL}/new_group`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response, 'Failed to create group');
  };

  export const fetchAllGroups = async () => {
    const response = await fetch(`${API_BASE_URL}/all_groups`);
    return handleResponse(response, 'Failed to fetch groups');
  };

  export const fetchGroupDetail = async (groupName, username) => {
    const response = await fetch(`${API_BASE_URL}/group_detail/${groupName}/${username}`);
    return handleResponse(response, 'Failed to fetch group details');
  };

  export const joinGroup = async (groupName, username) => {
    const formData = new FormData();
    formData.append('grpname', groupName);
    formData.append('username', username);

    const response = await fetch(`${API_BASE_URL}/join_group`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response, 'Failed to join group');
  };

  export const leaveGroup = async (groupName, username) => {
    const formData = new FormData();
    formData.append('grpname', groupName);
    formData.append('username', username);

    const response = await fetch(`${API_BASE_URL}/leave_group`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response, 'Failed to leave group');
  };

  export const fetchChat = async (user1, user2) => {
    const response = await fetch(`${API_BASE_URL}/get_chat/${user1}/${user2}`);
    return handleResponse(response, 'Failed to fetch chat');
  };

  export const sendMessage = async (sender, receiver, msg) => {
    const formData = new FormData();
    formData.append('sender', sender);
    formData.append('receiver', receiver);
    formData.append('msg', msg);

    const response = await fetch(`${API_BASE_URL}/new_chat_msg`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response, 'Failed to send message');
  };

  export const fetchAllFollowers = async (username) => {
    const response = await fetch(`${API_BASE_URL}/all_followers/${username}`);
    return handleResponse(response, 'Failed to fetch followers');
  };

  export const fetchAllUsers = async () => {
    const response = await fetch(`${API_BASE_URL}/all_users`);
    return handleResponse(response, 'Failed to fetch users');
  };

  export const verifyUser = async (username) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/${username}`);
      if (!response.ok) {
          const text = await response.text();
          console.error(`Verification failed for user ${username}. Status: ${response.status}, Response: ${text}`);
          return false;
      }
      return true;
    } catch (error) {
      console.error(`Error verifying user ${username}:`, error);
      return false;
    }
  };
  // Add these functions to src/utils/api.js

  export const fetchUserFollowers = async (username) => {
    const response = await fetch(`${API_BASE_URL}/all_followers/${username}`);
    return handleResponse(response, 'Failed to fetch user followers');
  };

  export const fetchUserFollowing = async (username) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user_following/${username}`);
      const data = await handleResponse(response, 'Failed to fetch users being followed');
      
      // Make sure the response data is in the expected format
      if (Array.isArray(data)) {
        return data.map(item => {
          // Handle different possible data formats
          if (typeof item === 'string') {
            return { following: item };
          } else if (item.username && !item.following) {
            return { following: item.username };
          }
          return item;
        });
      }
      return [];
    } catch (error) {
      console.error('Error in fetchUserFollowing:', error);
      throw error;
    }
  };


  // Group Chat Functions
  export const fetchGroupChat = async (groupName) => {
    const response = await fetch(`${API_BASE_URL}/group_chat/${groupName}`);
    return handleResponse(response, 'Failed to fetch group chat');
  };

  export const sendGroupMessage = async (groupName, sender, message) => {
    const formData = new FormData();
    formData.append('grp_name', groupName);
    formData.append('sender', sender);
    formData.append('message', message);

    const response = await fetch(`${API_BASE_URL}/send_group_message`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response, 'Failed to send message');
  };

  // Group Join Request Functions
  export const requestJoinGroup = async (groupName, username) => {
    const formData = new FormData();
    formData.append('grpname', groupName);
    formData.append('username', username);

    const response = await fetch(`${API_BASE_URL}/request_join_group`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response, 'Failed to send join request');
  };

  export const fetchGroupJoinRequests = async (groupName) => {
    const response = await fetch(`${API_BASE_URL}/group_join_requests/${groupName}`);
    return handleResponse(response, 'Failed to fetch join requests');
  };

  export const approveGroupRequest = async (requestId, action) => {
    const formData = new FormData();
    formData.append('request_id', requestId);
    formData.append('action', action); // 'approved' or 'rejected'

    const response = await fetch(`${API_BASE_URL}/approve_group_request`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response, 'Failed to process request');
  };

  // Follow Request Functions
  
  // Follow Request Functions
export const requestFollow = async (requester, target) => {
  // Extract username if requester is an object
  const requesterParam = typeof requester === 'object' ? requester.username : requester;
  
  try {
    // Changed to use path parameters instead of form data
    const response = await fetch(`${API_BASE_URL}/request_follow/${requesterParam}/${target}`, {
      method: 'POST',
    });
    
    return handleResponse(response, 'Failed to send follow request');
  } catch (error) {
    console.error('Error sending follow request:', error);
    throw error;
  }
};

  export const fetchFollowRequests = async (username) => {
    // Check if username is an object (currentUser might be an object with username property)
    const userParam = typeof username === 'object' ? username.username : username;
    
    try {
      const response = await fetch(`${API_BASE_URL}/follow_requests/${userParam}`);
      return handleResponse(response, 'Failed to fetch follow requests');
    } catch (error) {
      console.error('Error fetching follow requests:', error);
      throw error;
    }
  };

  export const approveFollowRequest = async (requestId, action) => {
    const formData = new FormData();
    formData.append('request_id', requestId);
    formData.append('action', action); // 'approved' or 'rejected'
  
    const response = await fetch(`${API_BASE_URL}/approve_follow_request`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response, 'Failed to process request');
  };

  // Remove member/follower
  export const removeGroupMember = async (groupName, admin, username) => {
    const formData = new FormData();
    formData.append('grp_name', groupName);
    formData.append('admin', admin);
    formData.append('username', username);

    const response = await fetch(`${API_BASE_URL}/remove_group_member`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response, 'Failed to remove member');
  };

  export const removeFollower = async (user, follower) => {
    const formData = new FormData();
    formData.append('user', user);
    formData.append('follower', follower);

    const response = await fetch(`${API_BASE_URL}/remove_follower`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(response, 'Failed to remove follower');
  };
  // Add these functions to your api.js file

  export const fetchUserPosts = async (username) => {
    const response = await fetch(`${API_BASE_URL}/user_posts/${username}`);
    return handleResponse(response, 'Failed to fetch user posts');
  };

  export const fetchGroupDetails = async (groupName, username) => {
    const response = await fetch(`${API_BASE_URL}/group_detail/${groupName}/${username}`);
    return handleResponse(response, 'Failed to fetch group details');
  };


  export const fetchGroupMembers = async (groupName) => {
    const response = await fetch(`${API_BASE_URL}/group_members/${groupName}`);
    return handleResponse(response, 'Failed to fetch group members');
  };

  export const fetchGroupPosts = async (groupName) => {
    const response = await fetch(`${API_BASE_URL}/group_posts/${groupName}`);
    return handleResponse(response, 'Failed to fetch group posts');
  };

  export const createPost = async (username, content, groupName = null) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('content', content);
    
    if (groupName) {
      formData.append('group_name', groupName);
    }
    
    const response = await fetch(`${API_BASE_URL}/new_post`, {
      method: 'POST',
      body: formData,
    });
    
    return handleResponse(response, 'Failed to create post');
  };