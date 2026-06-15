export function LandingResumePreview() {
  return (
    <div className="rounded-lg bg-white p-4 text-black text-xs leading-relaxed space-y-2">
      <div className="text-center">
        <p className="text-sm font-bold">John Doe</p>
        <p className="text-[10px] text-gray-500">Senior Product Designer</p>
      </div>
      <div className="border-b border-gray-200 pt-1" />
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600">Summary</p>
        <p className="mt-0.5 text-[10px] text-gray-700">Product designer with 8+ years of experience crafting user-centered digital products.</p>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600">Experience</p>
        <p className="mt-0.5 text-[10px] font-medium">Senior Product Designer @ Linear</p>
        <p className="text-[10px] text-gray-500">2022 - Present</p>
        <p className="text-[10px] text-gray-700">Lead designer for core product experience.</p>
      </div>
      <div className="flex gap-1">
        {["Figma", "Design Systems", "UX"].map((s) => (
          <span key={s} className="rounded-full bg-gray-100 px-2 py-0.5 text-[9px] text-gray-600">{s}</span>
        ))}
      </div>
    </div>
  )
}
