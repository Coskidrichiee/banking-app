import {
    useEffect,
    useState
} from "react";

import axios from "axios";

import {
    FaUserPlus,
    FaSearch,
    FaEdit,
    FaTrash,
    FaEye
} from "react-icons/fa";

import "../css/users.css";

import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";


function Users() {


    const [users,setUsers] =
        useState([]);


    const [loading,setLoading] =
        useState(true);


    const [search,setSearch] =
        useState("");

    const navigate = useNavigate();



    // ==========================
    // LOAD USERS
    // ==========================

    useEffect(()=>{

        fetchUsers();

    },[]);



    const fetchUsers = async()=>{


        try{


            const response =
                await axios.get(
                    "https://banking-app-zlqr.onrender.com/api/admin/users"
                );


            setUsers(
                response.data.users || []
            );


        }
        catch(error){

            console.log(
                "Users Error:",
                error
            );

        }
        finally{

            setLoading(false);

        }

    };




    // ==========================
    // DELETE USER
    // ==========================

    const deleteUser = async(id)=>{


        const confirmDelete =
            window.confirm(
                "Delete this user?"
            );


        if(!confirmDelete)
            return;



        try{


            await axios.delete(
                `https://banking-app-zlqr.onrender.com/api/admin/users/${id}`
            );


            fetchUsers();


        }
        catch(error){

            console.log(error);

        }


    };





    const filteredUsers =
        users.filter(user=>

            user.full_name
            ?.toLowerCase()
            .includes(
                search.toLowerCase()
            )

        );





    if(loading){


        return (

            <div className="users-loading">

                Loading Users...

            </div>

        );

    }





    return (

        <div className="users-page">



            {/* HEADER */}

            <div className="users-header">


                <div>

                    <h1>
                        Users Management
                    </h1>

                    <p>
                        Manage all Richiee Bank customers
                    </p>

                </div>



                <button className="add-user-btn">

                    <Link
                        to="/admin/users/add"
                        className="add-user-btn"
                    >
                        <FaUserPlus />
                        <span>Add User</span>
                    </Link>

                </button>


            </div>





            {/* SEARCH */}

            <div className="users-toolbar">


                <div className="search-box">


                    <FaSearch/>


                    <input

                        type="text"

                        placeholder="Search users..."

                        value={search}

                        onChange={(e)=>
                            setSearch(
                                e.target.value
                            )
                        }

                    />


                </div>


            </div>







            {/* TABLE */}


            <div className="users-card">


                <div className="table-responsive">


                    <table>


                        <thead>

                            <tr>

                                <th>
                                    #
                                </th>


                                <th>
                                    Name
                                </th>


                                <th>
                                    Email
                                </th>


                                <th>
                                    Account Number
                                </th>


                                <th>
                                    Balance
                                </th>


                                <th>
                                    Status
                                </th>


                                <th>
                                    Action
                                </th>


                            </tr>


                        </thead>





                        <tbody>


                        {
                            filteredUsers.map(
                                (user,index)=>(


                                <tr key={user.id}>


                                    <td>
                                        {index+1}
                                    </td>


                                    <td>

                                        {user.full_name}

                                    </td>



                                    <td>

                                        {user.email}

                                    </td>




                                    <td>

                                        {user.account_number}

                                    </td>




                                    <td>

                                        $
                                        {
                                            Number(
                                                user.balance
                                            )
                                            .toLocaleString()
                                        }

                                    </td>




                                    <td>


                                        <span
                                        className={
                                            user.status==="active"
                                            ?
                                            "active-status"
                                            :
                                            "inactive-status"
                                        }
                                        >

                                            {
                                                user.status
                                            }

                                        </span>


                                    </td>





                                    <td>


                                        <div className="action-buttons">


                                            <button
                                                className="view"
                                                onClick={() =>
                                                    navigate(
                                                        `/admin/users/${user.id}`
                                                    )
                                                }
                                            >
                                                <FaEye/>
                                            </button>



                                            <button
                                            className="edit"
                                            >

                                                <FaEdit/>

                                            </button>




                                            <button

                                            className="delete"

                                            onClick={()=>
                                                deleteUser(
                                                    user.id
                                                )
                                            }

                                            >

                                                <FaTrash/>

                                            </button>



                                        </div>


                                    </td>



                                </tr>


                            ))

                        }


                        </tbody>



                    </table>



                </div>



            </div>



        </div>

    );


}


export default Users;