export default function NavalMapPage() {
  return (
    <div className="pt-16 h-screen bg-sandstone-light">
      <div className="h-full">
        <iframe
          src="https://na-map.netlify.app/"
          className="w-full h-full border-none"
          title="Naval Action Map"
          allowFullScreen
        />
      </div>
    </div>
  );
}
