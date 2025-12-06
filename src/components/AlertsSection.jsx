// src/components/AlertsSection.jsx

export default function AlertsSection({ alerts, onViewAlert }) {
    return (
        <div className="mt-6">
            <h2 className="text-3xl font-bold text-white mb-4">Recent Alerts</h2>
            <div className="flex flex-col gap-3">
                {alerts.map(alert => (
                    // Pass the onViewAlert function as the 'onView' prop
                    <AlertItem 
                        key={alert.id} 
                        alert={alert} 
                        onView={onViewAlert} 
                    />
                ))}
            </div>
        </div>
    );
}