<template>
  <div>
    <v-row class="align-center">
      <v-col md="auto" class="justify-end">
        {{label}}
      </v-col>
      <v-col>
        <v-row class="justify-center">
          <v-col md="2">
            <v-text-field @change="update();" v-model="year" class="centered-input" suffix="年" :rules="[rules.required, rules.isdigit]"></v-text-field>
          </v-col>
          <v-col md="2">
            <v-text-field @change="update();" v-model="month" class="centered-input" suffix="月" :rules="[rules.required, rules.isdigit]"></v-text-field>
          </v-col>
          <v-col md="2">
            <v-text-field @change="update();" v-model="day" class="centered-input" suffix="日" :rules="[rules.required, rules.isdigit]"></v-text-field>
          </v-col>
          <v-col md="1" class="align-self-center">
            <v-btn small @click.stop="datePickModalShow = true"><v-icon>mdi-calendar-month</v-icon></v-btn>
          </v-col>
          <v-col md="2">
            <v-text-field @change="update();" v-model="hour" class="centered-input" suffix="時" :rules="[rules.required, rules.isdigit]"></v-text-field>
          </v-col>
          <v-col md="2">
            <v-text-field @change="update();" v-model="minute" class="centered-input" suffix="分" :rules="[rules.required, rules.isdigit]"></v-text-field>
          </v-col>
          <v-col md="1" class="align-self-center">
            <v-btn small @click.stop="timePickModalShow = true"><v-icon>mdi-clock-outline</v-icon></v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-dialog v-model="datePickModalShow" max-width="300">
      <v-date-picker v-model="datePicker" locale="ja-jp">
        <v-spacer></v-spacer>
        <v-btn text color="danger" @click="datePickModalShow = false">キャンセル</v-btn>
        <v-btn text color="primary" @click="datePickModalShow = false; onDatePicked();">OK</v-btn>
      </v-date-picker>
    </v-dialog>
    <v-dialog v-model="timePickModalShow" max-width="300">
      <v-time-picker v-model="timePicker" format="24hr">
        <v-spacer></v-spacer>
        <v-btn text color="danger" @click="timePickModalShow = false">キャンセル</v-btn>
        <v-btn text color="primary" @click="timePickModalShow = false; onTimePicked();">OK</v-btn>
      </v-time-picker>
    </v-dialog>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch, Prop, Emit } from 'vue-property-decorator'
import { DateTime } from 'luxon'

@Component
export default class DateInputField extends Vue {
  timePicker: any = null
  timePickModalShow: boolean = false
  datePicker: any = new Date().toISOString().substr(0, 10)
  datePickModalShow: boolean = false

  rules: any = {
    required: (value: string) => {
      if (`${value}` == "0") value = "0";
      return !!value || '必須です'
    },
    isdigit: (value: string) => {
      const pattern = /^\d+$/
      return pattern.test(value) || '数字のみ可'
    },
  }

  /////////////////////////
  year: any = null
  month: any = null
  day: any = null
  hour: any = null
  minute: any = null

  get valueDt() {
    if ([this.year, this.month, this.day, this.hour, this.minute].map(d => /^\d+$/.test(d)).every(b => b)) {
      return DateTime.fromObject({
        year: this.year,
        month: this.month,
        day: this.day,
        hour: this.hour,
        minute: this.minute
      });
    } else {
      return null;
    }
    
  }
  /////////////////////////

  @Prop()
  label!: string

  @Prop()
  type!: string

  @Prop()
  value!: DateTime

  onDatePicked() {
    const dt = DateTime.fromISO(this.datePicker);
    this.year = dt.year;
    this.month = dt.month;
    this.day = dt.day;
    this.update();
  }

  onTimePicked() {
    const dt = DateTime.fromISO(this.timePicker);
    this.hour = dt.hour;
    this.minute = dt.minute;
    this.update();
  }

  @Emit('input')
  update() {
    return this.valueDt;
  }
}
</script>
<style lang="scss">
  .centered-input input {
    text-align: center
  }
</style>