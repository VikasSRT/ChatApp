import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Menu,
  MessageCircle,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserSearch } from "@/hooks/useUserSearch";
import { useAuth } from "@/context/AuthContext";
import useUIStore from "@/stores/useUIStore";
import useChatStore from "@/stores/useChatStore";

export const Navbar = () => {
  const {
    searchText,
    hasSearched,
    userSearchResults,
    isUsersLoading,
    isUserLoadingError,
    searchHandler,
    setSearchText,
    setHasSearched,
    setUserSearchResults,
  } = useUserSearch();
  const { tokenSetter, userData } = useAuth();
  const { sidebarOpen, setSidebarOpen, isAnonymous, setIsAnonymous } =
    useUIStore();
  const { startChatHandler } = useChatStore();

  const handleStartChat = async (user) => {
    setSearchText("");
    setUserSearchResults([]);
    setHasSearched(false);

    try {
      await startChatHandler(userData, user);
    } catch (error) {
      console.error("Failed to start chat:", error);
    }
  };

  const handleLogout = () => {
    tokenSetter(null);
  };

  const toggleAnonymousMode = () => {
    setIsAnonymous(!isAnonymous);
  };

  return (
    <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5 text-gray-500 md:hidden" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <span className="text-lg font-semibold text-gray-800">
                Mehfil
              </span>
            </div>
          </div>

          {/* Search Section */}
          <div className="hidden md:block max-w-xl mx-auto">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                name="search"
                value={searchText}
                onChange={(e) => searchHandler(e.target.value)}
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                autoComplete="off"
              />

              {/* Loading indicator inside input */}
              {isUsersLoading && searchText && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Search Results Dropdown */}
            {searchText && (
              <div className="absolute z-50 w-96 mt-1 bg-white border border-gray-200 rounded-lg shadow-md max-h-96 overflow-y-auto">
                <div className={`${isUsersLoading ? "p-2" : ""} bg-white`}>
                  {isUsersLoading ? (
                    <div className="py-8 text-center text-gray-500">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Searching users...
                    </div>
                  ) : isUserLoadingError ? (
                    <div className="py-4 text-center text-red-500 text-sm">
                      Failed to search users. Please try again.
                    </div>
                  ) : userSearchResults?.length === 0 && hasSearched ? (
                    <div className="py-4 text-center text-gray-500 text-sm">
                      No users found matching "{searchText}"
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {userSearchResults?.map((user, index) => (
                        <div
                          key={user?._id || index}
                          className="flex items-center p-3 rounded-md hover:bg-gray-50 cursor-pointer transition-colors group"
                          onClick={() => {
                            setSearchText("");
                            console.log("Selected user:", user);
                          }}
                        >
                          <Avatar className="h-9 w-9">
                            <AvatarImage
                              src={
                                user?.avatar ||
                                `/avatars/${(index % 5) + 1}.png`
                              }
                              alt={user?.username}
                            />
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {user?.name?.charAt(0) ||
                                user?.username?.charAt(0) ||
                                "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="ml-3 flex-1 min-w-0">
                            <p className="font-medium text-gray-800 truncate">
                              {user?.username || `User ${index + 1}`}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user?.email || "user@example.com"}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs px-2 border-gray-600 border-2 text-primary cursor-pointer hover:bg-primary/5"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartChat(user);
                            }}
                          >
                            Chat
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-3">
            {/* Anonymous Mode Button */}
            <Button
              onClick={toggleAnonymousMode}
              variant={isAnonymous ? "default" : "outline"}
              className={`${
                isAnonymous
                  ? "bg-purple-500 hover:bg-purple-600 text-white"
                  : "border-purple-400 text-purple-500 hover:text-purple-600"
              } transition-all duration-200`}
            >
              <span className="text-sm font-medium">
                {isAnonymous ? "Anonymous Chat Mode" : "Anonymous Chat Mode"}
              </span>
              {isAnonymous && (
                <span className="ml-1 h-2 w-2 rounded-full bg-white" />
              )}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={userData?.avatar || "/avatars/01.png"}
                      alt={userData?.username || "User"}
                    />
                    <AvatarFallback className="bg-gray-100 text-gray-600">
                      <span className="font-medium">
                        {userData?.username
                          ?.split(" ")
                          ?.map((c) => c?.charAt(0)?.toUpperCase())
                          ?.join("") || "U"}
                      </span>
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {userData?.username}
                    </p>
                    <p className="text-xs leading-none text-gray-500">
                      {userData?.email || ""}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Users className="mr-2 h-4 w-4 text-gray-400" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4 text-gray-400" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-500 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4 text-red-500" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 py-2 border-t border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search users..."
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-white"
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
