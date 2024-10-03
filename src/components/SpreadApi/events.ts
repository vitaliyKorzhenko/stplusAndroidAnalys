// /*
//   Subscribe to Excel events
//   Implemented:
//     workbook.onSelectionChange()
// */
// import { addLog } from "../logs";

// export class ExcelEventsReceiver {
//     /*
//       Array of pairs { workbook, handler}, where
//         * handler is event receveir
//         * workbook - Excel.Workbook event handler is installed for.
//     */
//     private static eventHandlers: Array<{
//         workbook: Excel.Workbook;
//         handler: OfficeExtension.EventHandlerResult<Excel.Workbook>;
//       }> = [];
  
//     /*
//         Event handler - Selection changed
//         Works only for current workbook.
  
//         See demos:
//         https://github.com/alx-andru/office-js-lab/blob/f4782e717fc9ab52228f9cd20362211eb7255c91/src/app/app.component.ts
//     */
//     public static addOnSelectionChanged = async(callback: (args) => any) => {
//       addLog(null,'Event.ts addOnSelectionChanged','addEventHandler()');

//       let handlerIndex = 0;
//       await Excel.run(async context => {
//           const workbook = context.workbook;
//           const handler = workbook.onSelectionChanged.add(async (args:Excel.SelectionChangedEventArgs) => {
//             callback(args);
//           });
          
//           handlerIndex = ExcelEventsReceiver.eventHandlers.push({workbook, handler });
//           await context.sync();
//           addLog(null,'Event.ts addOnSelectionChanged','Waiting for selection...');
//         }).catch(function(error) {
//           addLog('error','Event.ts addOnSelectionChanged', error);
//           if (error instanceof OfficeExtension.Error) {
//             addLog('error','Event.ts OfficeExtension.Error', error.debugInfo);
//           }
//         })
//         return handlerIndex;
//     }

//     public static removeHandlerByIndex = async(index: number) => {
//       const idx = index - 1;
//       if (idx < 0)
//         return;
//       if (ExcelEventsReceiver.eventHandlers.length === 0) {
//         addLog(null,'Event.ts removeHandlerByIndex','ExcelEventsReceiver: No event handlers added');
//         return;
//       }
//       const lastEventHandler = ExcelEventsReceiver.eventHandlers[idx];
//       if (idx != ExcelEventsReceiver.eventHandlers.length - 1) {
//         ExcelEventsReceiver.eventHandlers[idx] = ExcelEventsReceiver.eventHandlers.pop();
//       } 
//       else {
//         ExcelEventsReceiver.eventHandlers.pop();
//       }
//       await Excel.run(lastEventHandler.workbook, async context => {
//         lastEventHandler.handler.remove();
//         await context.sync();
//       }).catch(function(error) {
//         addLog('error','Event.ts removeAllHandlers Error remove:',error);
//         if (error instanceof OfficeExtension.Error) {
//           addLog('error','Event.ts removeAllHandlers Debug info',error.debugInfo);
//         }
//       });
//   }
  
//     public static removeAllHandlers = async() => {
//         if (ExcelEventsReceiver.eventHandlers.length === 0) {
//           addLog(null,'Event.ts removeAllHandlers','ExcelEventsReceiver: No event handlers added');
//           return;
//         }
//         while (ExcelEventsReceiver.eventHandlers.length > 0) {
//           const lastEventHandler = ExcelEventsReceiver.eventHandlers.pop();
//           await Excel.run(lastEventHandler.workbook, async context => {
//             lastEventHandler.handler.remove();
//             await context.sync();
//           }).catch(function(error) {
//             addLog('error','Event.ts removeAllHandlers Error remove:',error);
//             if (error instanceof OfficeExtension.Error) {
//               addLog('error','Event.ts removeAllHandlers Debug info',error.debugInfo);
//             }
//           });
//       }
//     }
//   }