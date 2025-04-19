import React from 'react';
import { approveGroupRequest, approveFollowRequest } from '../utils/api';

const RequestItem = ({ request, type, onRequestUpdate, currentUser }) => {
  // For follow requests, check if current user is the target
  const isFollowTarget = type === 'follow' && request?.target === currentUser?.username;
  
  // For group requests, check if current user is admin
  const isGroupAdmin = type === 'group' && request?.admin === currentUser?.username;
  
  // Can approve if admin for group requests or target for follow requests AND status is pending
  const canApprove = ((type === 'group' && isGroupAdmin) || 
                     (type === 'follow' && isFollowTarget)) && 
                     request?.status === 'pending';

  const displayName = request?.username || 'Unknown User';
  const firstChar = displayName.charAt(0).toUpperCase();

  const handleAction = async (action) => {
    try {
      if (type === 'group') {
        await approveGroupRequest(request.id, action);
      } else {
        await approveFollowRequest(request.id, action);
      }
      // Call the parent function to refresh the requests list
      onRequestUpdate();
    } catch (error) {
      console.error(`Failed to ${action} request:`, error);
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg mb-2 flex justify-between items-center">
      <div className="flex items-center">
        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
          {firstChar}
        </div>
        <div className="ml-3">
          <p className="font-semibold text-white">
            {displayName}
          </p>
          <p className="text-sm text-gray-400">
            {type === 'group'
              ? `Wants to join ${request?.grp_name || 'group'}`
              : `Wants to follow you`}
          </p>
          <p className="text-xs text-gray-500">
            {request?.request_time ? new Date(request.request_time).toLocaleString() : ''}
          </p>
        </div>
      </div>
      
      {canApprove ? (
        <div className="flex space-x-2">
          <button 
            onClick={() => handleAction('approved')}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm text-white"
          >
            Approve
          </button>
          <button 
            onClick={() => handleAction('rejected')}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm text-white"
          >
            Reject
          </button>
        </div>
      ) : (
        <span className="px-3 py-1 bg-gray-700 rounded text-sm text-gray-300">
          {request?.status ? request.status.charAt(0).toUpperCase() + request.status.slice(1) : 'Processed'}
        </span>
      )}
    </div>
  );
};

export default RequestItem;