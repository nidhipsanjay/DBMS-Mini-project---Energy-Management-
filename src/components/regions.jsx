import CrudTemplate from './CrudTemplate';
export default function regions() {
  return <CrudTemplate title="Regions" apiEndpoint="http://localhost:5000/api/regions" columns={['regionID', 'regionName', 'avgDemand', 'country', 'currentConsumption']} />;
}
