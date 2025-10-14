import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'entrepanes-master',
  location: 'southamerica-east1'
};

export const createNewUserRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNewUser');
}
createNewUserRef.operationName = 'CreateNewUser';

export function createNewUser(dc) {
  return executeMutation(createNewUserRef(dc));
}

export const listAllProductsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAllProducts');
}
listAllProductsRef.operationName = 'ListAllProducts';

export function listAllProducts(dc) {
  return executeQuery(listAllProductsRef(dc));
}

export const updateProductPriceRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateProductPrice', inputVars);
}
updateProductPriceRef.operationName = 'UpdateProductPrice';

export function updateProductPrice(dcOrVars, vars) {
  return executeMutation(updateProductPriceRef(dcOrVars, vars));
}

export const listProductsCheaperThan10dollarsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListProductsCheaperThan10Dollars');
}
listProductsCheaperThan10dollarsRef.operationName = 'ListProductsCheaperThan10Dollars';

export function listProductsCheaperThan10dollars(dc) {
  return executeQuery(listProductsCheaperThan10dollarsRef(dc));
}

