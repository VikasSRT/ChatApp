import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const GroupCreationModal = ({
  showGroupModal,
  setShowGroupModal,
  groupName,
  setGroupName,
  selectedUsers,
  setSelectedUsers,
  groupCreating,
  searchText,
  isUsersLoading,
  userSearchResults,
  hasSearched,
  searchHandler,
  startChatHandler,
  handleCreateGroup,
  chats,
}) => {
  if (!showGroupModal) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2a3 3 0 015.356-1.857M7 20h10m0-2a3.003 3.003 0 00-5.356-1.857M5 9v-2m5.77 1.43l-3.374-3.375M13.89 17.51a3.001 3.001 0 005.11 0M12 18a6 6 0 00-6-6h-2a2 2 0 00-2 2v2a2 2 0 002 2h2a6 6 0 006-6m0 0a6 6 0 006-6h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2a6 6 0 00-6 6"
              />
            </svg>
            <h2 className="font-extrabold text-xl text-gray-800">
              Create New Group
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setShowGroupModal(false);
              setSearchText("");
              setUserSearchResults([]);
              setSelectedUsers([]);
              setGroupName("");
            }}
            className="hover:bg-gray-100 rounded-full"
          >
            <span className="text-gray-500 hover:text-gray-900 text-xl font-light">
              ×
            </span>
          </Button>
        </div>
        {/* Group Name Input */}
        <div className="px-5 pt-5 pb-3 border-b border-gray-100">
          <Input
            placeholder="Choose a group name..."
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full py-2 px-3 border border-gray-300 rounded-lg text-lg font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
            autoFocus
          />
        </div>
        {/* Search & User Selection */}
        <div className="p-5">
          {/* Search Bar */}
          <div className="relative mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <Input
              placeholder="Search members to add..."
              value={searchText}
              onChange={(e) => searchHandler(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
            />
            {isUsersLoading && searchText && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          {/* Selected Users Preview */}
          {selectedUsers.length > 0 && (
            <div className="mb-4 pt-2 border-t border-dashed border-gray-200">
              <h3 className="text-sm font-semibold mb-3 flex items-center text-gray-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1 text-indigo-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Members Added ({selectedUsers.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((userId) => {
                  const user =
                    userSearchResults.find((u) => u._id === userId) ||
                    chats
                      .find((c) => c._id === userId)
                      ?.participants?.find((p) => p._id === userId);
                  return (
                    <div
                      key={userId}
                      className="flex items-center bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full pl-3 pr-1 py-1 text-sm font-medium"
                    >
                      <span className="mr-1">
                        {user?.username || user?.name || "User"}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 ml-1 hover:bg-indigo-200 rounded-full transition-colors"
                        onClick={() =>
                          setSelectedUsers((prev) =>
                            prev.filter((id) => id !== userId)
                          )
                        }
                      >
                        <span className="text-xs">✕</span>
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {/* User List */}
          <div className="max-h-64 overflow-y-auto pr-1">
            {searchText && (
              <div className="space-y-1">
                {isUsersLoading ? (
                  <div className="py-8 text-center text-gray-500">
                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Searching members...
                  </div>
                ) : isUserLoadingError ? (
                  <div className="py-4 text-center text-red-500 text-sm">
                    Failed to search users. Please try again.
                  </div>
                ) : userSearchResults.length === 0 && hasSearched ? (
                  <div className="py-4 text-center text-gray-500 text-sm">
                    No users found matching "
                    <span className="font-semibold">{searchText}</span>"
                  </div>
                ) : (
                  userSearchResults.map((user) => {
                    const isSelected = selectedUsers.includes(user._id);
                    return (
                      <div
                        key={user._id}
                        className={`flex items-center p-3 rounded-xl cursor-pointer transition-all ${
                          isSelected
                            ? "bg-indigo-50 border border-indigo-200"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedUsers((prev) =>
                              prev.filter((id) => id !== user._id)
                            );
                          } else {
                            setSelectedUsers((prev) => [...prev, user._id]);
                          }
                        }}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={
                              user.avatar ||
                              `/avatars/${
                                Math.floor(Math.random() * 5) + 1
                              }.png`
                            }
                            alt={user.username}
                          />
                          <AvatarFallback className="bg-indigo-100 text-indigo-600 font-bold">
                            {user.username?.charAt(0) ||
                              user.name?.charAt(0) ||
                              "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-3 flex-1 min-w-0">
                          <p className="font-semibold truncate text-gray-900">
                            {user.username || user.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user.email}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="h-5 w-5 rounded-full bg-indigo-500 flex items-center justify-center border-2 border-white shadow-md">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-white"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 13.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
        {/* Footer Buttons */}
        <div className="p-4 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50">
          <Button
            variant="outline"
            onClick={() => {
              setShowGroupModal(false);
              setSearchText("");
              setUserSearchResults([]);
              setSelectedUsers([]);
              setGroupName("");
            }}
            disabled={groupCreating}
            className="px-4 py-2 text-sm font-semibold rounded-lg text-gray-600 border border-gray-300 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateGroup}
            disabled={
              !groupName.trim() || selectedUsers.length < 2 || groupCreating
            }
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:bg-indigo-300"
          >
            {groupCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Creating...
              </>
            ) : (
              "Create Group"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GroupCreationModal;
