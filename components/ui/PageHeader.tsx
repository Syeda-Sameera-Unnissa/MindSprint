export default function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center mb-10">
      <h1 className="text-3xl font-bold 
        bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 
        text-transparent bg-clip-text">
        {title}
      </h1>

      {subtitle && (
        <p className="text-sm text-gray-400 mt-2">{subtitle}</p>
      )}
    </div>
  );
}