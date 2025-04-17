import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { useAuthContext } from "~/context/AuthContext";
import { LoginForm } from "./login-form";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { LogoutForm } from "./logout-form";

export function AuthAvatar() {
  const { spotify } = useAuthContext();

  if (!spotify.isAuthenticated) {
    return (
      <div className="flex items-center gap-3">
        <LoginForm />
        <Avatar>
          <AvatarFallback>NN</AvatarFallback>
        </Avatar>
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex items-center gap-3 cursor-pointer">
          <p className="text-orange-500 text-sm">{spotify.name || ""}</p>
          <Avatar>
            <AvatarImage src={spotify.avatar} />
            <AvatarFallback>{spotify.name?.slice(0, 2) || "NN"}</AvatarFallback>
          </Avatar>
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <LogoutForm />
      </PopoverContent>
    </Popover>
  );
}
