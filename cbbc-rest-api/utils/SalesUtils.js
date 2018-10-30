

module.exports = {
    updateStatus: updateStatus
}
/*
Sale entity may have these statuses:
- ON_SALE - sale has been created and putted on sale,
- OFFERED - offer of the sale has been provided,
- PARTIAL_SALE - means that some of the items were sold,
- SOLD - means that all sale items were sold.
*/
function updateStatus(object){
  if(object._id === null || object._id === undefined){
    object.status = 'ON_SALE';
  }
}
