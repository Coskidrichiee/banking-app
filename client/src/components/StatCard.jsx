import "../css/admin.css";

export default function StatCard({
    title,
    value,
    icon,
    color = "blue",
    change = "",
}) {

    return (

        <div className={`stat-card ${color}`}>

            <div className="stat-card-top">

                <div className={`stat-icon ${color}`}>
                    {icon}
                </div>

                {change && (
                    <span className="stat-change">
                        {change}
                    </span>
                )}

            </div>

            <div className="stat-card-body">

                <span className="stat-title">
                    {title}
                </span>

                <h2 className="stat-value">
                    {value}
                </h2>

            </div>

        </div>

    );

}