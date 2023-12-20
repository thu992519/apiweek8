//參數
const url="https://livejs-api.hexschool.io/api/livejs/v1/customer";
const apiname="nakoruru08";
let cartData=[];

function init(){
    getCartList();//執行程式 取得購物車列表
    getProductsList();//執行程式 取得產品列表

}


init();
//取得產品列表

function getProductsList(){
    axios.get(`${url}/${apiname}/products`).then(
        function(res){
        // console.log(res);
        renderProduct(res.data);
        addcart();
        searchdown(res.data)

        }
    ).catch(function(err){
        
    })
};


function renderProduct(element){ //渲染產品
  
    let str="";
    element.products.forEach((item)=>{
    
    str+= `<li class="productCard" data-id=${item.id}>
                <h4 class="productType">新品</h4>
                <img src=${item.images} alt="">
                <a href="#" class="addCardBtn">加入購物車</a>
                <h3>${item.title}</h3>
                <del class="originPrice">NT$${item.origin_price}</del>
                <p class="nowPrice">NT${item.price}</p>
            </li>`;
    
    });
    document.querySelector(".productWrap").innerHTML=str;
};



//取得購物車列表
function getCartList() {
    axios.get(`${url}/${apiname}/carts`).then(
        function (res) {
    //    console.log("先");
        cartData = res.data.carts;
        renderCart(res.data);
      
        // console.log(cartData);
      
      

      }).catch(function(err){
        console.log(err.response.data)
    })
  };

  

function renderCart(element){
   if(cartData.length===0){
    document.querySelector(".shoppingCart-table").innerHTML="購物車空了,趕快加入吧";
   }else{
    let str="";
    element["carts"].forEach((item)=>{
        // console.log(item.product);
        str+=` <tr>
        <td>
            <div class="cardItem-title" >
                <img src=${item.product.images} alt="">
                <p>${item.product.title}</p>
            </div>
        </td>
        <td>NT$ ${item.product.price}</td>
        <td>${item.quantity}</td>
        <td>NT$${item.product.price*item.quantity}</td>
        <td class="discardBtn">
            <a href="#" class="material-icons" data-cartid=${item.id}>
                clear
            </a>
        </td>
    </tr>`
    });

    let cartlist=`<tr>
    <th width="40%">品項</th>
    <th width="15%">單價</th>
    <th width="15%">數量</th>
    <th width="15%">金額</th>
    <th width="15%"></th>
</tr>
${str}
<tr>
    <td>
        <a href="#" class="discardAllBtn">刪除所有品項</a>
    </td>
    <td></td>
    <td></td>
    <td>
        <p>總金額</p>
    </td>
    <td>NT${element.finalTotal}</td>
</tr>`;
    document.querySelector(".shoppingCart-table").innerHTML=cartlist;
   }
    
};

//購物車POST 新增購物車 用觸發的
function addcart(){ //要放在資料渲染後
    let productCard = document.querySelectorAll(".productCard");
// console.log(productCard);
productCard.forEach((item) => {
   
    item.addEventListener("click", (e) => {
        e.preventDefault();
        
        if(e.target.getAttribute("class")!=="addCardBtn"){
            return
        }else{
           let productId=item.getAttribute("data-id");
           postcart(productId);
        }
    });
});

}

function postcart(id){
   
    let num=(cartData.find((item)=>item.product.id==id)?.quantity||0)+1;
    axios.post(`${url}/${apiname}/carts`,
    {
        "data": {
          "productId": id,
          "quantity": num
        }
      }
    ).then(function(){
        getCartList();//新增完要重新渲染carts
    }
    )
};

//刪除特定產品+全刪除 想法是點到購物車 全刪除跟部分刪除用 class 去找

function deleteCartItem(cartId) { //部分刪除api
    axios.delete(`${url}/${apiname}/carts/${cartId}`)
      .then(function (response) {
        getCartList();//重新渲染carts
      })
  };

  function deleteAllCartList() { //全刪除api
    axios.delete(`${url}/${apiname}/carts`).
      then(function (response) {
        
        getCartList();//重新渲染carts
       
      })
  }

  //主體來了 點擊監控
  
  let delcart=document.querySelector(".shoppingCart");
//   console.log(delcart);

  delcart.addEventListener("click",(e)=>{
    e.preventDefault();
    //單項刪除
    if(e.target.getAttribute("class")=="material-icons"){
       
        let delcartid=e.target.getAttribute("data-cartid");
        console.log(delcartid);
        deleteCartItem(delcartid);
    }else if(e.target.getAttribute("class")=="discardAllBtn"){ //全刪除
        deleteAllCartList();
    }
  });

  //送出購買訂單
  function createOrder(user) {

    axios.post(`${url}/${apiname}/orders`,
      {
        "data": {
          "user": user
        
        }
      }
    ).
      then(function (response) {
        confirm('資料已送出');
        getCartList();//重新渲染carts
      })
      .catch(function(error){
        console.log(error.response.data);
      })
  }
  let submitbtn=document.querySelector(".orderInfo-btn");
  

  submitbtn.addEventListener("click",(e)=>{
    e.preventDefault();
    let name=document.querySelector("#customerName");
    let phone=document.querySelector("#customerPhone");
    let mail=document.querySelector("#customerEmail");
    let address=document.querySelector("#customerAddress");
    let paymethod=document.querySelector("#tradeWay");
    let formlist=document.querySelector(".orderInfo-form");
    let userdata={};
    userdata.name=name.value;
    userdata.tel=phone.value;
    userdata.email=mail.value;
    userdata.address=address.value;
    userdata.payment=paymethod.value;
    console.log(userdata);
    if(name.value==""||phone.value==""||mail.value==""||address.value==""||paymethod.value==""){
        alert("資料不可空白");
        return
    }else{
        createOrder(userdata);
       
        formlist.reset();
    }
  });

  //下拉式選單搜尋
  let select=document.querySelector(".productSelect");
  function searchdown(data){
    select.addEventListener("change",(e)=>{
        let filterdata={ products:[] };
        if(e.target.value=="全部"){
            renderProduct(data);
            addcart();
        }else{
            console.log(data.products);
            data.products.forEach( (item)=>{
                if(item.category==e.target.value){
                    filterdata.products.push(item);
                }
            });
            console.log(filterdata);
            renderProduct(filterdata);
            addcart();
        }
          
            // console.log(e);                                
    });
  }
  