import React, { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Mail, Zap, Shield, Github, Linkedin } from "lucide-react";
function HomePage() {
  const [isOpen, setIsOpen] = useState(false);
  async function loginbyGoogle() {
    try {
 
      await (window.location.href = `${import.meta.env.VITE_BACKEND_URL}/users/auth`);
        
    } catch (error) {
        console.error('Login failed:', error);
    }
}
  return (
    <>
      <nav className="bg-gray-800 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex-shrink-0">
              <Link to="/" className="text-xl font-bold">
                MailQuell
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8">
              <Link to="/" className="hover:text-gray-300 px-3 py-2">
                Home
              </Link>
              <Link to="/pricing" className="hover:text-gray-300 px-3 py-2">
                Pricing
              </Link>
              {/* <a href="/pricing" className="hover:text-gray-300 px-3 py-2">
                Pricing
              </a> */}
              <Link to="/contact" className="hover:text-gray-300 px-3 py-2">
                Contact
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-300 hover:text-white focus:outline-none"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden ${isOpen ? "block" : "hidden"}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="block px-3 py-2 hover:bg-gray-700 rounded-md"
            >
              Home
            </Link>
            <Link
              to="/pricing"
              className="block px-3 py-2 hover:bg-gray-700 rounded-md"
            >
                Pricing
            </Link>
            <Link
              to="/contact"
              className="block px-3 py-2 hover:bg-gray-700 rounded-md"
            >
              Contact
            </Link>
          </div>
        </div>
      </nav>
      <div className="flex flex-col min-h-screen min-w-full bg-white text-gray-900">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center text-center py-20 px-6 bg-gradient-to-b from-indigo-50 to-white">
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            Manage Your Gmail Smarter with{" "}
            <span className="text-indigo-600">MailQuell</span>
          </h1>
          <p className="text-lg max-w-2xl mb-8 text-gray-600">
            Boost your productivity with AI-powered email management. Stay
            organized, save time, and focus on what matters.
          </p>
          <div className="flex gap-4">
            <Button onClick={loginbyGoogle} size="lg" className="bg-blue-800 text-amber-50 cursor-pointer">Get Started</Button>
            <Button size="lg" className="bg-amber-50 text-blue-800 cursor-pointer" variant="outline">Learn More</Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-6 bg-white">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Powerful Features</h2>
            <p className="text-gray-600 mt-2">
              Everything you need to take control of your inbox.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="shadow-md hover:shadow-lg transition">
              <CardHeader>
                <Mail className="w-10 h-10 text-indigo-600 mb-2" />
                <CardTitle>Email Categorization</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">
                Automatically sort and filter emails with smart AI rules.
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-lg transition">
              <CardHeader>
                <Zap className="w-10 h-10 text-indigo-600 mb-2" />
                <CardTitle>Productivity Boost</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">
                Focus only on important emails with smart prioritization.
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-lg transition">
              <CardHeader>
                <Shield className="w-10 h-10 text-indigo-600 mb-2" />
                <CardTitle>Privacy & Security</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">
                Your data stays private and secure with enterprise-level
                encryption.
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 px-6 bg-gray-50">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
            <p className="text-gray-600 mt-2">
              Quick answers to common questions.
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-foreground">
                  Is MailQuell free to use?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes! We offer a free plan with essential features. Premium
                  plans unlock advanced AI capabilities.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-foreground">
                  Is my data secure?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Absolutely. We use bank-level encryption and never sell your
                  data to third parties.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-foreground">
                  How do I get started?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Simply sign in with your Gmail account and let MailQuell do
                  the rest.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-300 py-12 px-6 mt-auto">
          <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
            {/* About */}
            <div>
              <h3 className="text-xl font-bold text-white mb-3">MailQuell</h3>
              <p className="text-sm mb-4">
                Powerful email management tools to help you stay productive and
                organized with your Gmail account.
              </p>
              <div className="flex gap-4">
                <a
                  href="https://github.com/anupammaiti10"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Github className="w-5 h-5 hover:text-white transition" />
                </a>
                <a
                  href="https://www.linkedin.com/in/anupam-maiti-122470318"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Linkedin className="w-5 h-5 hover:text-white transition" />
                </a>
              </div>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="mailto:maitianuapm567@gmail.com"
                    className="hover:text-white"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/privacy.html" className="hover:text-white">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms.html" className="hover:text-white">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-12 pt-6 text-center text-sm">
            &copy; 2025 MailQuell. All rights reserved. • Made with ♥ in India
          </div>
        </footer>
      </div>
    </>
  );
}

export default HomePage;
