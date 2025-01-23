import React from "react";
import "./index.css";
const NotFound = () => {
  return (
    <section class="page_404">
      <div class="container">
        <div class="row">
          <div>
            <div class="text-center">
              <div class="four_zero_four_bg">
                <h1 class="text-center">404</h1>
              </div>
              <img
                src="https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif"
                alt="not-found"
                className="img-not-found"
              />
              <div class="contant_box_404">
                <h3 class="h2">Look like you're lost</h3>

                <p>the page you are looking for not avaible!</p>

                <a href="/" class="link_404">
                  Go to Home
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotFound;
