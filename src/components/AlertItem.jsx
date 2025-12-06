// src/components/AlertItem.jsx

// Accept 'onView' as a prop
export default function AlertItem({ alert, onView }) {
    const priorityStyles = {
        Critical: 'bg-red-500/80 text-red-100',
        High: 'bg-orange-500/80 text-orange-100',
        Medium: 'bg-yellow-500/80 text-yellow-100',
    };
    const statusStyles = {
        Open: 'border-blue-400 text-blue-300',
        Acknowledged: 'border-green-400 text-green-300',
    };

    return (
        <div className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr_1fr] items-center p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors duration-200 gap-4 text-sm">
            {/* ... other divs for priority, location, etc. ... */}
            
            {/* Add the onClick handler to the button */}
            <button 
                onClick={() => onView(alert)} 
                className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg border border-slate-500"
            >
                <EyeIcon />
                <span>View</span>
            </button>
        </div>
    );
};