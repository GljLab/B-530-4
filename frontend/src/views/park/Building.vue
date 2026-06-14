<template>
  <div class="building-container">
    <el-card class="search-card">
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="楼宇名称">
          <el-input v-model="queryForm.buildingName" placeholder="请输入" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="楼宇类型">
          <el-select v-model="queryForm.buildingType" placeholder="全部" clearable>
            <el-option label="住宅楼" :value="1" />
            <el-option label="商业楼" :value="2" />
            <el-option label="综合楼" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="全部" clearable>
            <el-option label="正常使用" :value="1" />
            <el-option label="装修中" :value="2" />
            <el-option label="待交付" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>楼宇列表</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>新增楼宇
          </el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column label="楼宇图片" width="120" align="center">
          <template #default="{ row }">
            <el-image
              :src="row.mainImage || ''"
              :preview-src-list="getImageList(row)"
              fit="cover"
              class="building-image"
              style="width: 80px; height: 60px; border-radius: 4px;"
            >
              <template #error>
                <div class="image-error">
                  <el-icon :size="24"><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column prop="buildingName" label="楼宇名称" min-width="140" show-overflow-tooltip />
        <el-table-column prop="buildingCode" label="楼宇编号" width="120" />
        <el-table-column label="楼宇类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getBuildingTypeTagType(row.buildingType)" size="small">
              {{ getBuildingTypeLabel(row.buildingType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="楼层数" width="120" align="center">
          <template #default="{ row }">
            <div>地上 {{ row.totalFloors || 0 }} 层</div>
            <div class="sub-text">地下 {{ row.undergroundFloors || 0 }} 层</div>
          </template>
        </el-table-column>
        <el-table-column label="电梯数" width="120" align="center">
          <template #default="{ row }">
            <div>客梯 {{ row.passengerElevators || 0 }} 部</div>
            <div class="sub-text">货梯 {{ row.freightElevators || 0 }} 部</div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleView(row)">查看</el-button>
            <el-button type="warning" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="queryForm.pageNum"
        v-model:page-size="queryForm.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadData"
        @current-change="loadData"
        class="pagination"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="楼宇名称" prop="buildingName">
          <el-input v-model="form.buildingName" placeholder="请输入楼宇名称" />
        </el-form-item>
        <el-form-item label="楼宇编号" prop="buildingCode">
          <el-input v-model="form.buildingCode" placeholder="请输入楼宇编号" />
        </el-form-item>
        <el-form-item label="楼宇类型" prop="buildingType">
          <el-radio-group v-model="form.buildingType">
            <el-radio :label="1">住宅楼</el-radio>
            <el-radio :label="2">商业楼</el-radio>
            <el-radio :label="3">综合楼</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="地上楼层" prop="totalFloors">
          <el-input-number v-model="form.totalFloors" :min="0" :max="200" style="width: 100%" />
        </el-form-item>
        <el-form-item label="地下楼层" prop="undergroundFloors">
          <el-input-number v-model="form.undergroundFloors" :min="0" :max="20" style="width: 100%" />
        </el-form-item>
        <el-form-item label="客梯数量" prop="passengerElevators">
          <el-input-number v-model="form.passengerElevators" :min="0" :max="50" style="width: 100%" />
        </el-form-item>
        <el-form-item label="货梯数量" prop="freightElevators">
          <el-input-number v-model="form.freightElevators" :min="0" :max="20" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">正常使用</el-radio>
            <el-radio :label="2">装修中</el-radio>
            <el-radio :label="3">待交付</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="楼宇简介">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入楼宇简介" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Picture } from '@element-plus/icons-vue'
import api from '@/api'

const router = useRouter()
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const tableData = ref([])
const total = ref(0)
const formRef = ref(null)

const queryForm = reactive({
  pageNum: 1,
  pageSize: 10,
  buildingName: '',
  buildingType: null,
  status: null
})

const form = reactive({
  id: null,
  buildingName: '',
  buildingCode: '',
  buildingType: 1,
  totalFloors: 0,
  undergroundFloors: 0,
  passengerElevators: 0,
  freightElevators: 0,
  status: 1,
  description: ''
})

const dialogTitle = computed(() => form.id ? '编辑楼宇' : '新增楼宇')

const rules = {
  buildingName: [{ required: true, message: '请输入楼宇名称', trigger: 'blur' }],
  buildingCode: [{ required: true, message: '请输入楼宇编号', trigger: 'blur' }],
  buildingType: [{ required: true, message: '请选择楼宇类型', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const getBuildingTypeLabel = (type) => {
  const typeMap = {
    1: '住宅楼',
    2: '商业楼',
    3: '综合楼'
  }
  return typeMap[type] || '未知'
}

const getBuildingTypeTagType = (type) => {
  const typeMap = {
    1: 'success',
    2: 'primary',
    3: 'warning'
  }
  return typeMap[type] || 'info'
}

const getStatusLabel = (status) => {
  const statusMap = {
    1: '正常使用',
    2: '装修中',
    3: '待交付'
  }
  return statusMap[status] || '未知'
}

const getStatusTagType = (status) => {
  const statusMap = {
    1: 'success',
    2: 'warning',
    3: 'info'
  }
  return statusMap[status] || 'info'
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await api.parkBuilding.list(queryForm)
    tableData.value = res.data?.list || []
    total.value = res.data?.total || 0
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryForm.pageNum = 1
  loadData()
}

const handleReset = () => {
  queryForm.buildingName = ''
  queryForm.buildingType = null
  queryForm.status = null
  handleSearch()
}

const getImageList = (row) => {
  if (row.images && row.images.length > 0) {
    return row.images.map(img => img.imageUrl || img)
  }
  if (row.mainImage) {
    return [row.mainImage]
  }
  return []
}

const resetForm = () => {
  form.id = null
  form.buildingName = ''
  form.buildingCode = ''
  form.buildingType = 1
  form.totalFloors = 0
  form.undergroundFloors = 0
  form.passengerElevators = 0
  form.freightElevators = 0
  form.status = 1
  form.description = ''
}

const handleAdd = () => {
  resetForm()
  dialogVisible.value = true
}

const handleEdit = async (row) => {
  resetForm()
  try {
    const res = await api.parkBuilding.getById(row.id)
    Object.assign(form, {
      id: res.data.id,
      buildingName: res.data.buildingName,
      buildingCode: res.data.buildingCode,
      buildingType: res.data.buildingType,
      totalFloors: res.data.totalFloors || 0,
      undergroundFloors: res.data.undergroundFloors || 0,
      passengerElevators: res.data.passengerElevators || 0,
      freightElevators: res.data.freightElevators || 0,
      status: res.data.status,
      description: res.data.description || ''
    })
    dialogVisible.value = true
  } catch (error) {
    ElMessage.error('加载楼宇信息失败')
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      if (form.id) {
        await api.parkBuilding.update(form)
        ElMessage.success('修改成功')
      } else {
        await api.parkBuilding.add(form)
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      loadData()
    } catch (error) {
      ElMessage.error(error.message || '操作失败')
    } finally {
      submitLoading.value = false
    }
  })
}

const handleView = (row) => {
  router.push(`/park/building/detail/${row.id}`)
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除楼宇 "${row.buildingName}" 吗？`, '提示', { type: 'warning' })
    await api.parkBuilding.delete(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.search-card {
  margin-bottom: 20px;
}

.table-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.building-image {
  cursor: pointer;
}

.image-error {
  width: 80px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  color: #c0c4cc;
  border-radius: 4px;
}

.sub-text {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.pagination {
  margin-top: 20px;
  justify-content: flex-end;
}
</style>
