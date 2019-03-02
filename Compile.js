class Compile{
    constructor(el,vm){
       this.el = this.isElementNode(el)?el:document.querySelector(el);
       this.vm = vm;
       if(this.el){
           //如果这个元素能获取到，我们才开始编译
           //1.先把真实的DOM移入到内存中，fragment
           let fragment = this.nodeToFragment(this.el);  
           //2.编译=>提取想要的元素节点v-modle 和文本节点{{}}
           this.compile(fragment);
           //3.把编译好的fragment塞回页面
           this.el.appendChild(fragment)
       }
    }
    //是不是元素节点
    isElementNode(node){
        return node.nodeType === 1;
    }
    //是不是指令
    isDirective(name){
        return name.includes('v-')
    }
    //分两部分，先写一些辅助方法，再是核心方法
    compileElement(node){
          //带v-modle 
          let attrs = node.attributes;
          Array.from(attrs).forEach(
              attr =>{
                 let attrName = attr.name;
                 if(this.isDirective(attrName)){
                   // 取到对应的值放到节点中
                   let expr = attr.value;                       
                   // node vm.$data expr
                   let [,type] = attrName.split('-')  //解构赋值
                   CompileUtil[type](node,this.vm,expr)
                 }
              }
          )
    }
    compileText(node){
         // 带{{}}
         let expr = node.textContent; //取文本的内容
         let reg = /\{\{([^}]+)\}\}/g  //全局匹配
         if(reg.test(expr)){
             // node this.vm.$data expr
             CompileUtil['text'](node,this.vm,expr)
         }
    }
    compile(fragment){  //需要递归，拿到的childNodes只是第一层
        let childNodes = fragment.childNodes;       
        Array.from(childNodes).forEach(
            node=>{
                if(this.isElementNode(node)){  //是元素节点，还需要递归检查
                    this.compileElement(node)  //编译元素
                    this.compile(node)  //箭头函数this指向上一层的实例
                }else{             //文本节点
                    this.compileText(node)  //编译文本
                }
            }
        )
    }
    nodeToFragment(el){   //需要el元素放到内存中
       let fragment = document.createDocumentFragment();
       let Child;
       while(Child = el.firstChild){
           fragment.appendChild(Child);
       }
       return fragment;
    }
}
CompileUtil = {
    getVal(vm,expr){  //获取实例上的数据   
        expr = expr.split('.'); //如果遇到vm.$data[a.a]，希望先拿到vm.$data[a]             
        return  expr.reduce((prev,next)=>{  
            return prev[next]
        },vm.$data)      
    },
    setVal (vm,expr,value){
        expr = expr.split('.');        
        //收敛
        return expr.reduce((prev,next,currentIndex)=>{
            if(currentIndex === expr.length - 1){
                return prev[next] = value;
            }
            return prev[next];
        },vm.$data)
    },
    getTextVal(vm,expr){  //获取编译文本以后的结果
            return expr.replace(/\{\{([^}]+)\}\}/g,(...arguments)=>{  
                return this.getVal(vm,arguments[1]);
        })       
    },
    text(node,vm,expr){       // 文本处理        
       let updateFn = this.updater['textUpdater'];       
       //{{message.a}} => tangj
       let value = this.getTextVal(vm,expr);
       expr.replace(/\{\{([^}]+)\}\}/g,(...arguments)=>{
           new Watcher(vm,arguments[1],(newVaule)=>{
               // 如果数据变化，文本节点需要重新获取依赖的属性更新文本的的内容
               updateFn && updateFn(node,this.getTextVal(vm,expr));
           })
    })              
       updateFn && updateFn(node,value);      
    },  
    modle(node,vm,expr){   // 输入框处理
        let updateFn = this.updater['modleUpdater']
         // 'message.a' => [message.a] vm.$data['message'].a
         // 这里应该加一个监控，数据变化，调用这个watch的cb
         new Watcher(vm,expr,(newVaule)=>{
             //当值变化后将调用cb，将新的值传递过来
            updateFn && updateFn(node,this.getVal(vm,expr))
         });
         node.addEventListener('input',(e)=>{
             let newVaule = e.target.value;
             this.setVal(vm,expr,newVaule)
         })
        updateFn && updateFn(node,this.getVal(vm,expr))
    },
    updater:{
        textUpdater(ndoe,value){
             ndoe.textContent = value //文本更新
        },        
        modleUpdater(node,value){
             node.value = value
        }
    }
}

