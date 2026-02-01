export default function StatsCard({ title, value, change }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-gray-500">{title}</h3>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold">{value}</p>
        {change && (
          <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
            {change}
          </span>
        )}
      </div>
    </div>
  )
}