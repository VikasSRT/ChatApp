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
    <nav className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-6 w-6 md:hidden" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                Mehfil
              </span>
            </div>
          </div>

          <div className="hidden md:block max-w-xl mx-auto relative">
            {/* Added relative positioning */}
            <div className="relative md:w-80 lg:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                name="search"
                value={searchText}
                onChange={(e) => searchHandler(e.target.value)}
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 bg-muted/50 border-muted focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all"
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
              <div className="absolute z-50 w-full mt-1 bg-card border border-muted rounded-lg shadow-lg max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-1">
                <div className={`${isUsersLoading ? "p-2" : ""} bg-white`}>
                  {isUsersLoading ? (
                    <div className="py-8 text-center text-muted-foreground">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Searching users...
                    </div>
                  ) : isUserLoadingError ? (
                    <div className="py-4 text-center text-destructive text-sm">
                      Failed to search users. Please try again.
                    </div>
                  ) : userSearchResults?.length === 0 && hasSearched ? (
                    <div className="py-4 text-center text-muted-foreground text-sm">
                      No users found matching "{searchText}"
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {userSearchResults?.map((user, index) => (
                        <div
                          key={user?._id || index}
                          className="flex items-center p-2 rounded-md hover:bg-accent/50 cursor-pointer transition-colors group"
                          onClick={() => {
                            setSearchText("");
                            // setUserSearchResults([]);
                            // Handle user selection here
                            console.log("Selected user:", user);
                          }}
                        >
                          <Avatar className="h-8 w-8">
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
                            <p className="font-medium truncate">
                              {user?.username || `User ${index + 1}`}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {user?.email || "user@example.com"}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 text-xs px-2 bg-primary/10 hover:bg-primary/20 text-primary cursor-pointer"
                            onClick={() => handleStartChat(user)}
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
            {/* Theme Toggle (REMOVED) */}

            {/* Anonymous Mode Button */}
            <Button
              onClick={toggleAnonymousMode}
              className={`${
                isAnonymous
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/30"
                  : "bg-background hover:bg-accent border border-dashed border-purple-400/50 text-purple-400 hover:text-purple-500"
              } transition-all duration-300 group`}
            >
              <div className="flex items-center space-x-2">
                <span className="font-medium">
                  {isAnonymous ? "Anonymous Mode: ON" : "Anonymous Chat Mode"}
                </span>
                <div
                  className={`w-2 h-2 rounded-full ${
                    isAnonymous ? "bg-white" : "bg-purple-400"
                  } transition-all duration-300 group-hover:scale-125`}
                />
              </div>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full border-1 rounded-full p-2"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="/avatars/01.png" alt="User" />
                    <AvatarFallback>
                      <span className="font-medium text-primary">
                        {userData?.username
                          ?.split(" ")
                          ?.map((c) => `${c?.charAt(0)?.toUpperCase()}`)}
                      </span>
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mr-4" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {userData?.username}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {userData?.email || ""}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Users className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-500 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 py-2 border-t">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search chats..."
            className="pl-10 pr-4 py-2 bg-muted/50 border-muted focus:bg-background focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
