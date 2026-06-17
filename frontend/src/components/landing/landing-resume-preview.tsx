export function LandingResumePreview() {
  return (
    <div className="rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 p-4 text-gray-800 text-xs leading-relaxed space-y-2">
      <div className="text-center">
        <p className="text-sm font-bold font-heading text-gray-900">John Doe</p>
        <p className="text-[10px] text-gray-500">Senior Product Designer</p>
      </div>
      <div className="border-b border-gray-200 pt-1" />
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-brand-dark">Summary</p>
        <p className="mt-0.5 text-[10px] text-gray-700">Product designer with 8+ years of experience crafting user-centered digital products.</p>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-brand-dark">Experience</p>
        <p className="mt-0.5 text-[10px] font-medium text-gray-900">Senior Product Designer @ Linear</p>
        <p className="text-[10px] text-gray-500">2022 - Present</p>
        <p className="text-[10px] text-gray-700">Lead designer for core product experience.</p>
      </div>
      <div className="flex gap-1">
        {["Figma", "Design Systems", "UX"].map((s) => (
          <span key={s} className="rounded-full bg-brand/10 px-2 py-0.5 text-[9px] font-medium text-brand-dark">{s}</span>
        ))}
      </div>
    </div>
  )
}
