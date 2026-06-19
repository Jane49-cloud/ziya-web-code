import { useEffect, useState } from "react";
import { Card, Typography } from "antd";

import {
  useLazyGetCompanyAssetsQuery,
} from "../features/companyAssetSlice";
import CompanyAssetsTable, {
  type CompanyAsset,
} from "../components/companyAssetsTable";
import MoveAssetToPartnerDrawer from "../components/moveAssetToPartnerDrawer";
import MoveAssetToGroupDrawer from "../components/moveAssetToGroupDrawer";
import TabPagination from "../../utils/paginationUtil";

const { Title, Text } = Typography;

const CompanyAssetsPage = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [partnerAsset, setPartnerAsset] =
    useState<CompanyAsset | null>(null);

  const [groupAsset, setGroupAsset] =
    useState<CompanyAsset | null>(null);

  const [
    getCompanyAssets,
    {
      data,
      isLoading,
      isFetching,
    },
  ] = useLazyGetCompanyAssetsQuery();

  useEffect(() => {
    getCompanyAssets({
      page: page + 1,
      page_size: pageSize,
    });
  }, [
    page,
    pageSize,
    getCompanyAssets,
  ]);

  const assets: CompanyAsset[] =
    Array.isArray(data?.data) ? data.data : [];

  const total = Number(
    data?.total ??
      data?.total_assets ??
      data?.pagination?.total ??
      (page * pageSize +
        assets.length +
        (assets.length === pageSize ? 1 : 0)),
  );

  const refreshAssets = () => {
    getCompanyAssets({
      page: page + 1,
      page_size: pageSize,
    });
  };

  return (
    <Card>
      <Title level={3} style={{ marginBottom: 4 }}>
        Company Assets
      </Title>

      <Text type="secondary">
        View and assign company assets to partners and groups.
      </Text>

      <div style={{ marginTop: 24 }}>
        <CompanyAssetsTable
          data={assets}
          loading={isLoading || isFetching}
          onMoveToPartner={setPartnerAsset}
          onMoveToGroup={setGroupAsset}
        />

        <TabPagination
          page={page}
          pageSize={pageSize}
          total={total}
          loading={isLoading || isFetching}
          itemName="Assets"
          onPaginationChange={(
            nextPage,
            nextPageSize,
          ) => {
            setPage(nextPage);
            setPageSize(nextPageSize);
          }}
        />
      </div>

      <MoveAssetToPartnerDrawer
        open={Boolean(partnerAsset)}
        asset={partnerAsset}
        onClose={() => setPartnerAsset(null)}
        onMoved={() => {
          setPartnerAsset(null);
          refreshAssets();
        }}
      />

      <MoveAssetToGroupDrawer
        open={Boolean(groupAsset)}
        asset={groupAsset}
        onClose={() => setGroupAsset(null)}
        onMoved={() => {
          setGroupAsset(null);
          refreshAssets();
        }}
      />
    </Card>
  );
};

export default CompanyAssetsPage;