# 阿里云 uniCloud 数据层

当前 APP 默认使用本地 Repository。若后续需要多设备共享，可按以下步骤切换到阿里云：

1. 在 HBuilderX 中为项目关联一个 `uniCloud` 阿里云服务空间。
2. 右键 `cloudfunctions/campus-lostfound-api`，上传部署云函数。
3. 右键 `database/db_init.json`，初始化 `lost_found_items` 集合与索引。
4. 在 `src/config/index.js` 中填写 `cloudSpaceId`。
5. 修改运行偏好或代码中的 `dataSource` 为 `unicloud`，或调用 Store 的 `switchDataSource('unicloud')`。

当前 `clientId` 仅用于软件工程作业中的演示身份区分，不等同于正式认证。生产环境应替换为 `uni-id` 或其他经过验证的用户身份。
