class MVVM{
   constructor(options){
       //把东西挂载在实例上
       this.$el = options.el,
       this.$data = options.data
        // 如果有要编译的就开始编译 
        if(this.$el){
            //数据劫持，就是把对象的所有属性改成get和set方法
            new Observer(this.$data);
            //用数据和元素进行编译
            this.proxyData(this.$data);
            new Compile(this.$el,this);
        }      
   }
   proxyData(data){
       Object.keys(data).forEach(key =>{
           let val = data[key]
           Object.defineProperty(this,key,{
               enumerable:true,
               configurable:true,
               get(){                   
                   return val
               },
               set(newval){
                   if(val == newval){
                    return;
                   }
                   val = newval
               }
           })
       })
   }   
}