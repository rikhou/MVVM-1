class Observer{
    constructor(data){
        this.observer(data)
    }
    observer(data){ 
        //要对这个data数据原有属性改成set和get的形式
        if(!data || typeof data !== 'object') return;
         Object.keys(data).forEach(key =>{
             this.defineReactive(data,key,data[key]);
             this.observer(data[key])
         })         
    }
    defineReactive(obj,key,value){
        let that = this;       
        let dep = new Dep();  //每个变化的数据都会对应一个数组，这个数据存放了所有数据的更新
        Object.defineProperty(obj,key,{
            enumerable:true,         
            configurable:true,
            get(){                           
               Dep.target && dep.addSub(Dep.target);            
                return value;
            },
            set(newvalue){
                if(value === newvalue) return;              
                that.observer(newvalue);  //如果新值是对象，继续劫持
                value = newvalue;
                dep.notify(); //通知所有人数据更新
            },
        })
    }
}
class Dep{
    constructor(){
        //订阅的数组
        this.subs = []
    }
    addSub(watcher){
        this.subs.push(watcher)
    }
    notify(){
        this.subs.forEach(watcher =>{
            watcher.update()
        })
    }
}