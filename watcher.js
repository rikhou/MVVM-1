//观察者的目的就是给需要变化的那个元素增加一个观察者，当数据变化后执行对应的方法
class Watcher{
    constructor(vm,expr,cb){
        this.vm = vm;
        this.expr = expr;        
        this.cb = cb;
        //先获取老的值
        this.value = this.get()       
    }
    getVal(vm,expr){  //获取实例上的数据   
        expr = expr.split('.'); //如果遇到vm.$data[a.a]，希望先拿到vm.$data[a]        
        // console.log(expr)
        return  expr.reduce((prev,next)=>{  
            return prev[next]
        },vm.$data)      
    }
    get(){
        Dep.target = this;  //缓存自己
        let value = this.getVal(this.vm,this.expr);    
        Dep.target = null; //释放自己     
        return value;
    }
    update(){
        let newValue = this.getVal(this.vm,this.expr);       
        let oldValue = this.value;
        if(newValue != oldValue){
            this.cb(newValue);
        }
    }
}
