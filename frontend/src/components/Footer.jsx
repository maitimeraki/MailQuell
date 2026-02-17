import React from 'react'

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-container">
          {/* About Section */}
          <div className="footer-about">
            <div className="footer-logo">MailQuell</div>
            <p>
              Powerful email management tools to help you stay productive and organized with your Gmail
              account.
            </p>
            <div className="footer-social">
              {/* <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a> */}
              <a href="https://github.com/anupammaiti10/" aria-label="GitHub">
                <i className="fab fa-github"></i>
              </a>
              <a href="www.linkedin.com/in/anupam-maiti-122470318" aria-label="LinkedIn">
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>

          {/* Product Section (commented out as in original) */}
          <div>
            {/* <h3 className="footer-title">Product</h3>
            <ul className="footer-links">
              <li><a href="#">Features</a></li>
              <li><a href="#">Pricing</a></li>
              <li><a href="#">API</a></li>
              <li><a href="#">Integrations</a></li>
            </ul> */}
          </div>

          {/* Company Section */}
          <div>
            <h3 className="footer-title">Company</h3>
            <ul className="footer-links">
              {/* <li><a href="#">About</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Careers</a></li> */}
              <li>
                <a href="mailto:maitianuapm567@gmail.com">Contact</a>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h3 className="footer-title">Legal</h3>
            <ul className="footer-links">
              <li><a href="/privacy.html">Privacy Policy</a></li>
              <li><a href="/terms.html">Terms of Service</a></li>
              {/* <li><a href="#">Security</a></li>
              <li><a href="#">GDPR</a></li> */}
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p className="copyright">
            &copy; 2025 <a href="#">MailQuell, Inc.</a> All rights reserved.
            <span style={{ color: "rgba(184, 184, 184, 0.6)" }}>•</span>
            Made with ♥ in India
          </p>
        </div>
      </div>
    </footer>
  );
}


export default Footer