<template>
  <q-page class="row q-pt-xl">
    <div class="full-width q-px-xl">
      <div class="q-mb-xl">
        <q-input ref="nameRef" :rules="nameRules" v-model="tempData.name" label="姓名" />
        <q-input ref="ageRef" :rules="ageRules" type="number" v-model="tempData.age" label="年齡" />

        <q-btn v-if="actionMode === 'add'" @click="addUser" color="primary" class="q-mt-md">新增</q-btn>

        <div v-if="actionMode === 'edit'" class="q-gutter-xs">
          <q-btn @click="editUser" color="warning" class="q-mt-md">更新</q-btn>
          <q-btn @click="escapeEditMode" color="primary" class="q-mt-md">取消更新</q-btn>
        </div>
      </div>

      <q-table
        flat
        bordered
        ref="tableRef"
        :rows="blockData"
        :columns="(tableConfig as QTableProps['columns'])"
        row-key="id"
        hide-pagination
        separator="cell"
        :rows-per-page-options="[0]"
      >
        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
            <q-th></q-th>
          </q-tr>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              style="min-width: 120px"
            >
              <div>{{ col.value }}</div>
            </q-td>
            <q-td class="text-right" auto-width v-if="tableButtons.length > 0">
              <q-btn
                @click="handleClickOption(btn, props.row as UserModel)"
                v-for="(btn, index) in tableButtons"
                :key="index"
                size="sm"
                color="grey-6"
                round
                dense
                :icon="btn.icon"
                class="q-ml-md"
                padding="5px 5px"
              >
                <q-tooltip
                  transition-show="scale"
                  transition-hide="scale"
                  anchor="top middle"
                  self="bottom middle"
                  :offset="[10, 10]"
                >
                  {{ btn.label }}
                </q-tooltip>
              </q-btn>
            </q-td>
          </q-tr>
        </template>
        <template v-slot:no-data="{ icon }">
          <div
            class="full-width row flex-center items-center text-primary q-gutter-sm"
            style="font-size: 18px"
          >
            <q-icon size="2em" :name="icon" />
            <span> 無相關資料 </span>
          </div>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { QTableProps, Dialog, QInput } from 'quasar';
import { ref, onBeforeMount, onMounted } from 'vue';
import UserRepository from '../repositories/UserRepository';

interface btnType {
  label: string;
  icon: string;
  status: string;
}

const {
  create: userCreate,
  list: userList,
  delete: userDelete,
  update: userUpdate,
} = new UserRepository();

const blockData = ref<UserModel[]>([]);
const tableConfig = ref([
  {
    label: '姓名',
    name: 'name',
    field: 'name',
    align: 'left',
  },
  {
    label: '年齡',
    name: 'age',
    field: 'age',
    align: 'left',
  },
]);
const tableButtons = ref([
  {
    label: '編輯',
    icon: 'edit',
    status: 'edit',
  },
  {
    label: '刪除',
    icon: 'delete',
    status: 'delete',
  },
]);

const tempData = ref({
  id: '',
  name: '',
  age: '',
});

const actionMode = ref<'add' | 'edit'>('add');

const nameRef = ref<QInput>();
const ageRef = ref<QInput>();

const nameRules = [
  (val: string) => (val && val.length > 0) || '請輸入姓名',
  (val: string) => (val && val[0] !== ' ') || '第一個字不能是空白',
  (val: string) => (val && val.split('').reverse().join('')[0] !== ' ') || '最後一個字不能是空白',
]

const ageRules = [
  (val: string) => (val !== null && val !== '') || '請輸入年齡',
  (val: number) => (val > 0 && val <= 120) || '年齡需介於 1 ~ 120 歲',
]

onBeforeMount(async () => {
  await refreshData();
});

async function validateForm() {
  if (!nameRef.value || !ageRef.value) {
    alert('something wrong....');
    return ;
  }

  const nameValid = await nameRef.value.validate();
  const ageValid = await ageRef.value.validate();

  return nameValid && ageValid;
}

async function refreshData() {
  const response = await userList();
  blockData.value = response;
}

async function addUser() {
  if (!await validateForm()) {
    return ;
  }
  const response = await userCreate({
    name: tempData.value.name,
    age: parseInt(tempData.value.age, 10),
  });
  console.log(response);

  await refreshData();
}

async function editUser() {
  if (!await validateForm()) {
    return ;
  }
  const response = await userUpdate({
    id: tempData.value.id,
    name: tempData.value.name,
    age: parseInt(tempData.value.age, 10),
  });

  await refreshData();

  console.log(response);
}

async function  escapeEditMode() {
  actionMode.value = 'add';
  tempData.value = {
    id: '',
    name: '',
    age: '',
  };
}

async function handleClickOption(btn: btnType, user: UserModel) {
  if (btn.status === 'edit') {

    actionMode.value = 'edit';
    console.log('edit', user);
    tempData.value = {
      id: user.id,
      name: user.name,
      age: `${user.age}`,
    };

    return ;
  }

  if (btn.status === 'delete') {
    Dialog.create({
      title: '提示',
      message: '確定要刪除嗎？',
      cancel: {
        label: '取消',
      },
      ok: {
        label: '確定',
      },
      persistent: true,
    })
    .onOk(async () => {
      console.log('OK');
      await userDelete(user.id);
      await refreshData();
    }).onCancel(() => {
      console.log('Cancel');
    }).onDismiss(() => {
      console.log('I am triggered on both OK and Cancel');
    })
    return ;
  }

}

</script>

<style lang="scss" scoped>
.q-table th {
  font-size: 20px;
  font-weight: bold;
}

.q-table tbody td {
  font-size: 18px;
}
</style>
