import CrudTemplate from './CrudTemplate';
export default function Distribution() {
  return <CrudTemplate title="Distribution Records" apiEndpoint="http://localhost:5000/api/distribution" columns={['distributionID', 'fromPlant', 'toRegion', 'distributionDate', 'energySupplied']} />;
}
