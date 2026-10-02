const ContentManagement = () => {
  const sections = [
    "About",
    "Principal Desk",
    "Notices",
    "Events",
    "Gallery",
    "Contact",
    "Calendar"
  ];

  return (
    <div className="p-10">
      <h1 className="text-4xl font-bold text-slate-800 mb-8">
        Website Content Management
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        {sections.map((section, index) => (
          <div
            key={index}
            className="bg-white p-8 rounded-3xl shadow-md border border-slate-200 hover:shadow-xl transition"
          >
            <h2 className="text-2xl font-semibold text-slate-800">
              {section}
            </h2>

            <p className="text-slate-500 mt-2">
              Manage homepage {section.toLowerCase()} content
            </p>

            <button className="mt-6 bg-blue-600 text-white px-5 py-3 rounded-xl">
              Manage
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentManagement;