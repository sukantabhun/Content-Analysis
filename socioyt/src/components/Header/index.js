import React from "react";
import { Link } from "react-router-dom";
import "./index.css"; // Create a separate CSS file for header styling
import Logo from "../../assets/PageLogo.png"; // Import your logo
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  RedirectToSignIn,
  useUser,
} from "@clerk/clerk-react";

const Header = () => {
  const { user } = useUser();
  return (
    <header className="header">
      <div
        className="logo-container"
        onClick={() => (window.location.href = "/")}
      >
        <img src={Logo} alt="Website Logo" className="logo" />
        <h1 className="website-logo">SocioYT</h1>
      </div>
      <div className="signin-container">
        <h3>Hi, {user?.firstName}</h3>
        <Link to="/channel" className="signin-container-Link">
          Channel
        </Link>
        <Link to="/video" className="signin-container-Link">
          Video
        </Link>
        <SignedOut>
          <SignInButton
            path="/sign-in"
            routing="path"
            signUpUrl="/sign-up"
            style={{
              maxWidth: "400px",
              marginRight: "25px",
              padding: "10px",
              background: "transparent",
              border: "none",
            }}
          />
          <RedirectToSignIn />;
        </SignedOut>
        <SignedIn>
          <UserButton
            appearance={{
              elements: {
                // Custom styles for the button
                rootBox: {
                  backgroundColor: "transparent",
                  borderRadius: "8px",
                  border: "none",
                  marginRight: "28px",
                },
                avatarBox: {
                  width: "40px",
                  height: "40px",
                },
                popover: {
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  borderRadius: "12px",
                },
              },
            }}
          />
        </SignedIn>
      </div>
    </header>
  );
};

export default Header;
