//參數
const url="https://livejs-api.hexschool.io/api/livejs/v1/admin";
const apiname="nakoruru08";
let token="e7IYHkFBvASADbCB4rqAw4DXJ7Y2";
let headers={
  'Authorization': token
};

//初始化fun

function init(){
  getOrderList();
}

init();//初始化


//取得訂單資料

function getOrderList() {
    axios.get(`${url}/${apiname}/orders`,
      {
        headers: {
          'Authorization': token
        }
      })
      .then(function (response) {
        console.log("ok");

       
        rendertable(response.data.orders);
        dealbtn();
        deletedata();
        renderchart(response.data.orders)

      })
  }

//渲染到表格
function rendertable(data){
   
    
    let str=``; 
    data.forEach((item)=>{
    
      let timeitem= getdata(item.createdAt);
     
      let productstotal=item.products;
      // console.log(item.products);
      let productitem= renderpitem(productstotal);
      // console.log(productitem)
      
        str+=` <tr>
        <td>${item.createdAt}</td>
        <td>
          <p>${item.user.name}</p>
          <p>${item.user.tel}</p>
        </td>
        <td>${item.user.address}</td>
        <td>${item.user.email}</td>
        <td>
          ${productitem}
        </td>
        <td>${timeitem}</td>
        <td class="orderStatus">
          <a href="#" class="paidBtn" data-id="${item.id}" data-status="${item.paid}">${item.paid?'已處理':'未處理'}</a>
        </td>
        <td>
          <input type="button" class="delSingleOrder-Btn" data-id="${item.id}" value="刪除">
        </td>
    </tr>`
    
    })
    let table=`<thead>
    <tr>
        <th>訂單編號</th>
        <th>聯絡人</th>
        <th>聯絡地址</th>
        <th>電子郵件</th>
        <th>訂單品項</th>
        <th>訂單日期</th>
        <th>訂單狀態</th>
        <th>操作</th>
    </tr>
</thead> ${str}`;

    let list=document.querySelector(".orderPage-table");
    list.innerHTML=table;
}


//得到時間
function getdata(time){
  let datetime = new Date(time * 1000);
     

  return `${datetime.getFullYear()}/${datetime.getMonth()}/${datetime.getDate()}`
}

//刪除功能
function deletedata(){
  let deletebtn=document.querySelectorAll(".delSingleOrder-Btn");
  deletebtn.forEach((item)=>{
    item.addEventListener("click",(e)=>{
  e.preventDefault();
  
  
  if(e.target.getAttribute('class') === 'delSingleOrder-Btn'){
   
    deleteitem(e.target.dataset.id);
    getOrderList();
  }
  


  })

});

let allDel=document.querySelector(".discardAllBtn");
allDel.addEventListener("click",function(e){
  e.preventDefault();
  delall();
  
})

}

//刪除單筆
function deleteitem(id){
 
  axios.delete(`${url}/${apiname}/orders/${id}`,{ headers }).then(function(){
     getOrderList()
  }
  )
}

//全刪除
function delall(){
  axios.delete(`${url}/${apiname}/orders`,{ headers }).then(function(){
    getOrderList()
 }
 )
}




//處理 data裡面還有陣列 ``無法放變數又變數 另外處理
function  renderpitem(data){
   let text="";
    data.forEach((item)=>{
      text+=`<p>${item.title}</p>`;
    })
    return text;
}



//處理 未處理的部分

function dealbtn(){
  let dealbtn=document.querySelectorAll(".orderStatus");
  dealbtn.forEach((item)=>{
    item.addEventListener("click",(e)=>{
  e.preventDefault();
  
  if(e.target.getAttribute('class') === 'paidBtn'){
  
    editStatus(e.target.dataset.id, e.target.dataset.status);
    getOrderList();
  }
  })

});
}


function editStatus(id,status){
  // {
  //   "data": {
  //     "id": "訂單 ID (String)",
  //     "paid": true
  //   }
  // }

  let data = {
    id,
    paid: status === 'false' ? true : (status === 'true' ? false : true)
};



  axios.put(`${url}/${apiname}/orders`,{ data },{ headers }
     )
      .then(function () {
       
      })
}

//全品項營收
function renderchart(data){
console.log(data);
let prd=data.flatMap((item)=>(item.products));
console.log(prd);

let items={};
prd.forEach((item)=>{
  if(items[item.title]){
    items[item.title]+=item.price*item.quantity;
  }else{
    items[item.title]=item.price*item.quantity;
  };
 
})
//  console.log(items);
 let orderdata=[];
 console.log(Object.keys(items));
 Object.keys(items).forEach((key)=>{
  orderdata.push([key,items[key]]);
 })
 console.log(orderdata);
//排序
orderdata.sort((a, b) => b[1] - a[1]);
let first3=orderdata.slice(0,3);//前三高
let other=orderdata.slice(3);//其他
console.log(other);
console.log(first3);
//其他總和
 let lowersum=other.reduce((acc,curr)=>acc+curr[1],0)
let chartdata=[...first3,["其他",lowersum]];

// C3.js
let chart = c3.generate({
  bindto: '#chart', // HTML 元素綁定
  data: {
      type: "pie",
      columns:chartdata ,
      colors:{
        pattern: ["#301E5F", "#9D7FEA", "#5434A7", "#DA1234"]
      }
  },
});




};
