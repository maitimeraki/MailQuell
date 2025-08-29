import React from 'react'
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
function Hero() {
  return (
    <section className="text-center py-20 bg-gradient-to-b from-blue-50 to-white">
      <motion.h1
        className="text-5xl font-bold text-gray-900"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Transform Your Email Experience
      </motion.h1>
      <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
        MailQuell helps you stay productive with smart email organization,
        automatic filtering, and Gmail-powered AI tools.
      </p>
      <Button className="mt-6">Continue with Google</Button>
    </section>
  );
}

export default Hero