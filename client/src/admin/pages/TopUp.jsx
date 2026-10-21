import {
    FaMoneyBillWave,
    FaUser,
    FaDollarSign,
    FaCheckCircle
} from "react-icons/fa";

import "../css/adminTopUp.css";


function TopUp(){

    return(

        <div className="admin-page">


            <div className="page-header">

                <div>

                    <h1>
                        Account Top Up
                    </h1>

                    <p>
                        Add funds to customer accounts
                    </p>

                </div>


                <FaMoneyBillWave className="header-icon"/>

            </div>





            <div className="topup-container">



                <div className="topup-card">


                    <FaUser/>


                    <h3>
                        Select User
                    </h3>


                    <select>

                        <option>
                            Choose customer
                        </option>

                    </select>



                </div>





                <div className="topup-card">


                    <FaDollarSign/>


                    <h3>
                        Amount
                    </h3>


                    <input
                        type="number"
                        placeholder="Enter amount"
                    />


                </div>




                <div className="topup-card">


                    <FaCheckCircle/>


                    <h3>
                        Action
                    </h3>


                    <button>

                        Confirm Top Up

                    </button>


                </div>



            </div>





            <div className="transaction-box">


                <h2>
                    Recent Top Ups
                </h2>


                <table>

                    <thead>

                        <tr>

                            <th>
                                User
                            </th>

                            <th>
                                Amount
                            </th>

                            <th>
                                Status
                            </th>

                        </tr>

                    </thead>


                    <tbody>


                        <tr>

                            <td>
                                John Doe
                            </td>


                            <td>
                                $5,000
                            </td>


                            <td className="success">
                                Completed
                            </td>

                        </tr>


                    </tbody>


                </table>


            </div>



        </div>

    );

}


export default TopUp;