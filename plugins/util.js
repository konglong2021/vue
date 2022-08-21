export default function ({  }, inject) {
    const util = {
        format( num){
            return Number.parseFloat( num).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
        },
        formatInt(num){
          return (Number.parseInt( num)+"").replace(/\d(?=(\d{3})+\.)/g, '$&,');
        },
        cloneObject(obj) {
            return JSON.parse(JSON.stringify(obj));
          },
          roundKhDown( num){
            if( num % 100 > 0) {
                let minus  = num % 100;
                return num - minus;
            }
            return num;
      
          },
          isInt(n){
            return Number(n) === n && n % 1 === 0;
          },
        
    };
    inject('util',util);
}