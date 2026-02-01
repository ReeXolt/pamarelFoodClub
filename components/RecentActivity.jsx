export default function RecentActivity({ activities }) {
  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={index} className="flex justify-between items-center p-3 border-b">
          <div>
            <p className="font-medium">{activity.type}</p>
            <p className="text-sm text-gray-500">{activity.details}</p>
          </div>
          <p className="text-sm">{activity.time}</p>
        </div>
      ))}
    </div>
  )
}