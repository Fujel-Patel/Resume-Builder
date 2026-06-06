"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/ToastProvider";

// Simple Settings page with placeholder sections.
export default function SettingsPage() {
  const { addToast } = useToast();
  const [theme, setTheme] = useState("light");
  const [density, setDensity] = useState("comfortable");
  const [fontSize, setFontSize] = useState("medium");

  const handleSave = (section: string) => {
    addToast({ title: `${section} saved`, variant: "success" });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="section-heading text-3xl mb-4">Settings</h1>

      {/* Account Section */}
      <section className="border border-[--border] rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-3">Account</h2>
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-[--text-secondary]">Full Name</span>
            <Input type="text" placeholder="John Doe" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[--text-secondary]">Email</span>
            <Input type="email" placeholder="john@example.com" />
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="form-checkbox" />
            <span className="text-sm text-[--text-secondary]">Email notifications</span>
          </label>
          <Button variant="primary" onClick={() => handleSave("Account")}>Save Account</Button>
        </div>
      </section>

      {/* Appearance Section */}
      <section className="border border-[--border] rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-3">Appearance</h2>
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-[--text-secondary]">Theme</span>
            <select value={theme} onChange={e => setTheme(e.target.value)} className="w-full rounded border-gray-300">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[--text-secondary]">Density</span>
            <select value={density} onChange={e => setDensity(e.target.value)} className="w-full rounded border-gray-300">
              <option value="compact">Compact</option>
              <option value="comfortable">Comfortable</option>
              <option value="spacious">Spacious</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[--text-secondary]">Font Size</span>
            <select value={fontSize} onChange={e => setFontSize(e.target.value)} className="w-full rounded border-gray-300">
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </label>
          <Button variant="primary" onClick={() => handleSave("Appearance")}>Save Appearance</Button>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="border border-[--border] rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-3">Privacy</h2>
        <div className="space-y-4">
          <Button variant="secondary" onClick={() => addToast({ title: "Data export requested", variant: "info" })}>
            Export Data
          </Button>
          <Button variant="danger" onClick={() => addToast({ title: "Account deletion", description: "Feature not implemented", variant: "warning" })}>
            Delete Account
          </Button>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="border border-[--border] rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-3">Integrations</h2>
        <p className="text-sm text-[--text-secondary] mb-2">Connect third‑party services (placeholder).</p>
        <Button variant="secondary" onClick={() => addToast({ title: "Integrations", description: "Not yet implemented", variant: "info" })}>
          Manage Integrations
        </Button>
      </section>

      {/* Advanced Section */}
      <section className="border border-[--border] rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-3">Advanced</h2>
        <p className="text-sm text-[--text-secondary] mb-2">Advanced settings like data storage preferences, beta feature toggles.</p>
        <Button variant="secondary" onClick={() => addToast({ title: "Advanced", description: "Not implemented", variant: "info" })}>
          Open Advanced Settings
        </Button>
      </section>
    </div>
  );
}
