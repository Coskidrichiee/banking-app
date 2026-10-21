// src/admin/components/StatCard.jsx

import "../css/statcard.css";


function StatCard({
    title,
    value,
    icon,
    color = "#2563eb",
    subtitle = ""
}) {


    return (

        <div
            className="stat-card"
            style={{
                "--card-color": color
            }}
        >


            <div className="stat-card-top">


                <div className="stat-info">

                    <p className="stat-title">
                        {title}
                    </p>


                    <h3 className="stat-value">
                        {value}
                    </h3>


                    {
                        subtitle && (

                            <span className="stat-subtitle">
                                {subtitle}
                            </span>

                        )
                    }


                </div>



                <div
                    className="stat-icon"
                >

                    {icon}

                </div>


            </div>



            <div className="stat-footer">

                <span>
                    Updated recently
                </span>

            </div>


        </div>

    );

}


export default StatCard;