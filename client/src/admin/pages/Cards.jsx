import {

FaCreditCard,
FaUser,
FaLock,
FaCheckCircle

} from "react-icons/fa";


import "../css/adminCards.css";



function Cards(){


return(


<div className="admin-page">



<div className="page-header">


<div>

<h1>
Card Management
</h1>


<p>
Manage customer debit cards
</p>


</div>


<FaCreditCard className="header-icon"/>


</div>







<div className="card-grid">



<div className="bank-card">


<FaCreditCard/>


<h2>
**** **** **** 4589
</h2>


<p>
VISA Debit Card
</p>


<span>
Active
</span>


</div>





<div className="card-action">


<FaUser/>

<h3>
Assign Card
</h3>


<button>
Assign
</button>


</div>






<div className="card-action">


<FaLock/>


<h3>
Block Card
</h3>


<button>
Block
</button>


</div>






<div className="card-action">


<FaCheckCircle/>


<h3>
Activate Card
</h3>


<button>
Activate
</button>


</div>



</div>



</div>


);


}



export default Cards;