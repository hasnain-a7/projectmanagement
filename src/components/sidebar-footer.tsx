import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  SidebarFooter as SidebarFooterBase,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { FaUser, FaSignOutAlt } from "react-icons/fa";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { useNavigate } from "react-router-dom";
import { useUserContextId } from "@/AuthContext/UserContext";
import { ChevronUp } from "lucide-react";
import { useTaskContext } from "@/TaskContext/TaskContext";

interface SidebarFooterProps {
  setopen: (open: boolean) => void;
  state: "expanded" | "collapsed";
}

const SidebarFooter: React.FC<SidebarFooterProps> = ({ setopen, state }) => {
  const navigate = useNavigate();
  const { logout } = useUserContextId();
  const { userData } = useTaskContext();

  const handleLogout = async () => {
    logout();
  };

  return (
    <SidebarFooterBase>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            className={`relative w-full transition-all duration-200 ${
              state === "expanded"
                ? "flex items-center justify-between px-1 py-6"
                : "flex flex-col items-center justify-center gap-1 ml-2 py-3"
            }`}
            onClick={() => {
              if (state === "collapsed") setopen(true);
            }}
          >
            <Avatar
              className={`cursor-pointer transition-transform hover:scale-105 ${
                state === "collapsed" ? " h-10 w-10 " : ""
              }`}
            >
              <AvatarImage
                src={userData?.avatar || ""}
                alt="User Avatar"
                className="h-10 w-10 rounded-full object-cover"
              />
              <AvatarFallback className="text-sm font-medium">
                {userData?.fullname?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>

            {state === "expanded" && (
              <div className="flex-1 flex flex-col ml-2">
                <h3 className="text-sm font-semibold text-foreground truncate">
                  {userData?.fullname || "Account"}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {userData?.email || ""}
                </span>
              </div>
            )}

            {state === "expanded" && (
              <ChevronUp size={18} className="absolute top-2 right-3" />
            )}
          </SidebarMenuButton>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-52 shadow-lg rounded-lg border border-border/20">
          <DropdownMenuItem
            onClick={() => navigate("profile")}
            className="flex items-center gap-2 px-3 py-2 hover:bg-accent/10 transition-colors"
          >
            <FaUser className="h-4 w-4" /> Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 hover:bg-red-100 transition-colors text-chart-5"
          >
            <FaSignOutAlt className="h-4 w-4" /> Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarFooterBase>
  );
};

export default SidebarFooter;
