const Table = class{
    constructor(text_separator='"',column_separator=";",line_separator="\n"){
        this.cs=column_separator;
        this.ls=line_separator;
        this.ts=text_separator;
        this.values=[];
        this.adress=[];this.to_search_lat_lng=[];this.coord=[];
        this.sleeping_time_lat_lng=1/50;
        this.running_lat_ln=false;
        this.vizualize_id=[];
    };
    /*##############################################################################################*/
    /*                                       Ecriture du csv                                        */
    /*##############################################################################################*/
    write_str(){
        txt=""
        for (let i=0;i<this.values.length-1;i++){
            for (let j=0;j<this.values[i].length-1;j++){
                if (this.values[i][j].includes(this.cs)||this.values[i][j].includes(this.ls)){
                    txt=txt+this.ts+this.values[i][j].replaceAll(this.ts,"")+this.ts+this.cs;
                }else{
                    txt=txt+this.values[i][j].replaceAll(this.ts,"")+this.cs;
                };
            };
            if (this.values[i][this.values[i].length-1].includes(this.cs)||this.values[i][this.values[i].length-1].includes(this.ls)){
                txt=txt+this.ts+this.values[i][this.values[i].length-1].replaceAll(this.ts,"")+this.ts+this.cs;
            }else{
                txt=txt+this.values[i][this.values[i].length-1].replaceAll(this.ts,"")+this.cs;
            };
            txt=txt+this.ls;
        };
        for (let j=0;j<this.values[this.values.length-1].length-1;j++){
            if (this.values[this.values.length-1][j].includes(this.cs)||this.values[this.values.length-1][j].includes(this.ls)){
                txt=txt+this.ts+this.values[this.values.length-1][j].replaceAll(this.ts,"")+this.ts+this.cs;
            }else{
                txt=txt+this.values[this.values.length-1][j].replaceAll(this.ts,"")+this.cs;
            };
        };
        if (this.values[this.values.length-1][this.values[this.values.length-1].length-1].includes(this.cs)||this.values[this.values.length-1][this.values[i].length-1].includes(this.ls)){
            txt=txt+this.ts+this.values[this.values.length-1][this.values[this.values.length-1].length-1].replaceAll(this.ts,"")+this.ts+this.cs;
        }else{
            txt=txt+this.values[this.values.length-1][this.values[this.values.length-1].length-1].replaceAll(this.ts,"")+this.cs;
        };
    };
    download_csv(){
        var blob = new Blob([this.write_str()], {type: 'text/txt'});
		var url  = window.URL.createObjectURL(blob);
		var link = document.createElement("a");
		link.download = "Download.csv";
		link.href = url;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		//delete link;
    }
    /*##############################################################################################*/
    /*                                        Lecture du csv                                        */
    /*##############################################################################################*/
    read_str(s,line_of_names=0){
        this.line_of_names = line_of_names;
        this.values=[[]];
        var current_text="";
        var is_text=false;
        for (let i=0;i<s.length;i++){
            if (is_text){
                if (s[i]===this.ts){
                    is_text = False;
                }else{
                    current_text = current_text+s[i];
                };
            }else{
                if (s[i]===this.ts){
                    is_text = true;
                }else{
                    if(s[i]===this.ls){
                        this.values[this.values.length-1].push(current_text);
                        this.values.push([]);
                        current_text="";
                    }else{
                        if (s[i]===this.cs){
                            this.values[this.values.length-1].push(current_text);
                            current_text="";
                        }else{
                            current_text=current_text+s[i];
                        };
                    };
                };
            };
        };
        if (!(current_text==="")){
            this.values[this.values.length-1].push(current_text);
        };
        var test_last = true;
        for (let i=0;i<this.values[this.values.length-1].length;i++){
            if (!test_last){break;};
            test_last = test_last && [null,"",this.ts+this.ts].includes(this.values[this.values.length-1][i]);
        };
        if (test_last){
            this.values.splice(this.values.length-1,1)
        } 
        var test_last = true;
        for (let i=0;i<this.values.length;i++){
            test_last = [null,"",this.ts+this.ts].includes(this.values[i][this.values[i].length-1])
            if (!test_last){break;};
        };
        if (test_last){
            for (let i=0;i<this.values.length;i++){
                this.values[i].splice(this.values[i].length-1,1);
            };
        };
        var size=this.values[0].length;
        var test_last=true
        for (let i=0;i<this.values.length;i++){
            test_last = (this.values[i].length == size)
            if (!test_last){break;};
        };
        if (test_last){console.log("Le fichier CSV lue semble OK")}else{console.log("Le fichier CSV lu semble avoir un nombre de colonnes variable")}
        this.#actualize();
        this.get_adress();
    };
    read_file(file,encoding="utf-8",line_of_names=0){
        console.log(encoding)
        var elem = this;
        let reader = new FileReader();
        reader.onload=function(){
            var txt = reader.result.replaceAll("\r","\n").replaceAll("\n\n","\n");
            elem.read_str(txt,line_of_names);
        }
        reader.readAsText(file,encoding);
    };
    link_to_inputs(file_input,encoding_input=null){
        var elem = this;
        if (!(encoding_input===null)){
            encoding_input.setAttribute("list", "csv_encoding_list");
            var _datalist = document.createElement('datalist');
            _datalist.id = "csv_encoding_list"
            var _option = _datalist.appendChild(document.createElement('option'));
            _option.value="utf-8"
            var _option = _datalist.appendChild(document.createElement('option'));
            _option.value="windows-1254"
        };
        file_input.accept='.csv'
        file_input.onchange = function(){
            var encoding="utf-8";
            if (!(encoding_input==null)){encoding = encoding_input.value};
            if (file_input.files.length>0){
                let file = file_input.files[0];
                elem.read_file(file,encoding);
            };
        };
        encoding_input.onchange = function(){
            var encoding="utf-8";
            if (!(encoding_input==null)){encoding = encoding_input.value};
            if (file_input.files.length>0){
                let file = file_input.files[0];
                elem.read_file(file,encoding);
            };
        };
    };
    comlete_reader(element){
        var elem = this;
        var tbl = document.createElement("table")
        element.appendChild(tbl)
        var body = document.createElement("thead")
        var line = document.createElement("tr")
        var cell = document.createElement("th");cell.colSpan = 4;
        var inp1 = document.createElement("input");inp1.type="file";
        cell.appendChild(inp1)
        line.appendChild(cell)
        body.appendChild(line)
        var line = document.createElement("tr")
        var cell = document.createElement("th");cell.innerHTML = "Nombre de lignes d'entête";
        line.appendChild(cell)
        var cell = document.createElement("th");cell.innerHTML = "Séparateur des colonnes";
        line.appendChild(cell)
        var cell = document.createElement("th");cell.innerHTML = "Séparateur des lignes";
        line.appendChild(cell)
        var cell = document.createElement("th");cell.innerHTML = "Séparateur de texte";
        line.appendChild(cell)
        var cell = document.createElement("th");cell.innerHTML = "Encodage du fichier";
        line.appendChild(cell)
        body.appendChild(line)
        tbl.appendChild(body)
        var body = document.createElement("tbody")
        var line = document.createElement("tr")
        var cell = document.createElement("td")
        var inp2 = document.createElement("input");inp2.type="number";inp2.value=1;
        cell.appendChild(inp2);line.appendChild(cell)
        var cell = document.createElement("td")
        var inp3 = document.createElement("input");inp3.value=';';
        cell.appendChild(inp3);line.appendChild(cell)
        var cell = document.createElement("td")
        var inp4 = document.createElement("input");inp4.value="\n";
        cell.appendChild(inp4);line.appendChild(cell)
        var cell = document.createElement("td")
        var inp5 = document.createElement("input");inp5.value='"';
        cell.appendChild(inp5);line.appendChild(cell)
        var cell = document.createElement("td")
        var inp6 = document.createElement("input");inp6.value="windows-1254"
        cell.appendChild(inp6);line.appendChild(cell)
        body.appendChild(line)
        tbl.appendChild(body)
        inp1.onchange=function(){
            if (![null,""].includes(inp2.value)){this.line_of_names = inp2.value}else{this.line_of_names = 1};
            if (![null,""].includes(inp3.value)){this.cs = inp3.value}else{this.cs=";"};
            if (![null,""].includes(inp4.value)){this.ls = inp4.value}else{this.ls="\n"};
            if (![null,""].includes(inp5.value)){this.ts = inp5.value}else{this.ts='"'};
            if (![null,""].includes(inp6.value)){var encoding = inp6.value}else{var encoding="utf-8"};
            alert(1+" : "+inp1.files.length+" : "+encoding)
            if (inp1.files.length>0){
                let file = inp1.files[0];
                elem.read_file(file,encoding);
            };
        };
        inp2.onchange=function(){
            var encoding="utf-8";
            this.cs=column_separator;
            this.ls=line_separator;
            this.ts=text_separator;
            if (![null,""].includes(inp2.value)){this.line_of_names = inp2.value}else{this.line_of_names = 1};
            if (![null,""].includes(inp3.value)){this.cs = inp3.value}else{this.cs=";"};
            if (![null,""].includes(inp4.value)){this.ls = inp4.value}else{this.ls="\n"};
            if (![null,""].includes(inp5.value)){this.ts = inp5.value}else{this.ts='"'};
            if (![null,""].includes(inp6.value)){var encoding = inp6.value}else{var encoding="utf-8"};
            if (inp1.files.length>0){
                let file = inp1.files[0];
                elem.read_file(file,encoding);
            };
        };
        inp3.onchange=function(){
            var encoding="utf-8";
            this.cs=column_separator;
            this.ls=line_separator;
            this.ts=text_separator;
            if (![null,""].includes(inp2.value)){this.line_of_names = inp2.value}else{this.line_of_names = 1};
            if (![null,""].includes(inp3.value)){this.cs = inp3.value}else{this.cs=";"};
            if (![null,""].includes(inp4.value)){this.ls = inp4.value}else{this.ls="\n"};
            if (![null,""].includes(inp5.value)){this.ts = inp5.value}else{this.ts='"'};
            if (![null,""].includes(inp6.value)){var encoding = inp6.value}else{var encoding="utf-8"};
            if (inp1.files.length>0){
                let file = inp1.files[0];
                elem.read_file(file,encoding);
            };
        };
        inp4.onchange=function(){
            var encoding="utf-8";
            this.cs=column_separator;
            this.ls=line_separator;
            this.ts=text_separator;
            if (![null,""].includes(inp2.value)){this.line_of_names = inp2.value}else{this.line_of_names = 1};
            if (![null,""].includes(inp3.value)){this.cs = inp3.value}else{this.cs=";"};
            if (![null,""].includes(inp4.value)){this.ls = inp4.value}else{this.ls="\n"};
            if (![null,""].includes(inp5.value)){this.ts = inp5.value}else{this.ts='"'};
            if (![null,""].includes(inp6.value)){var encoding = inp6.value}else{var encoding="utf-8"};
            if (inp1.files.length>0){
                let file = inp1.files[0];
                elem.read_file(file,encoding);
            };
        };
        inp5.onchange=function(){
            var encoding="utf-8";
            this.cs=column_separator;
            this.ls=line_separator;
            this.ts=text_separator;
            if (![null,""].includes(inp2.value)){this.line_of_names = inp2.value}else{this.line_of_names = 1};
            if (![null,""].includes(inp3.value)){this.cs = inp3.value}else{this.cs=";"};
            if (![null,""].includes(inp4.value)){this.ls = inp4.value}else{this.ls="\n"};
            if (![null,""].includes(inp5.value)){this.ts = inp5.value}else{this.ts='"'};
            if (![null,""].includes(inp6.value)){var encoding = inp6.value}else{var encoding="utf-8"};
            if (inp1.files.length>0){
                let file = inp1.files[0];
                elem.read_file(file,encoding);
            };
        };
        inp6.onchange=function(){
            var encoding="utf-8";
            this.cs=column_separator;
            this.ls=line_separator;
            this.ts=text_separator;
            if (![null,""].includes(inp2.value)){this.line_of_names = inp2.value}else{this.line_of_names = 1};
            if (![null,""].includes(inp3.value)){this.cs = inp3.value}else{this.cs=";"};
            if (![null,""].includes(inp4.value)){this.ls = inp4.value}else{this.ls="\n"};
            if (![null,""].includes(inp5.value)){this.ts = inp5.value}else{this.ts='"'};
            if (![null,""].includes(inp6.value)){var encoding = inp6.value}else{var encoding="utf-8"};
            if (inp1.files.length>0){
                let file = inp1.files[0];
                elem.read_file(file,encoding);
            };
        };
    };
    /*##############################################################################################*/
    /*                                       Fonctions utiles                                       */
    /*##############################################################################################*/
    #simplify(word){
        var new_word=""
        var a = "aaaaaaabcdeeeeeeeeeefghiiiiijklmnooooopqrstuuuuuvwxyz";
        var A = "AÄÂäâà@BCDéèêëE€ËÊÈÉFGHïîIÏÎjklmnôöOÔÖPQRSTûüUÜÛVWXYZ"
        for (let i=0;i<word.length;i++){
            if (a.includes(word[i])){
                new_word=new_word+word[i]
            }else{
                if (A.includes(word[i])){
                    new_word = new_word+a[A.indexOf(word[i])];
                };
            };
        };
        return new_word;
    };
    #search_column(element,line_index=0){
        if ( (!(typeof line_index === "number")) || line_index < 0 || line_index >= this.values.length || (!(Math.floor(line_index)===line_index))){
            throw new EvalError("Ligne "+line_index+" non valide");
        }
        //recherche exacte
        for (let i=0; i<this.values[line_index].length;i++){
            if (this.values[line_index][i]===element){
                return [i,0];
            };
        };
        //recherche exacte sans le separateur de texte
        for (let i=0; i<this.values[line_index].length;i++){
            if (this.values[line_index][i].replaceAll(this.ts,"")===element.replaceAll(this.ts,"")){
                return [i,1];
            };
        };
        //recherche approximative
        for (let i=0; i<this.values[line_index].length;i++){
            if (this.#simplify(this.values[line_index][i])===this.#simplify(element)){
                return [i,2];
            };
        };
        //vérification que ce n'est pas un nombre qui à été donné
        return [-1,3]
    };
    search_column(List_of_possible_name){
        if (typeof List_of_possible_name ==="string"){
            return this.#search_column(List_of_possible_name,this.line_of_names)[0];
        };
        var List_of_result=[]
        for (let i=0;i<List_of_possible_name.length;i++){
            List_of_result.push(this.#search_column(List_of_possible_name[i],this.line_of_names));
        };
        var loc_min=5;
        for (let i=0;i<List_of_result.length;i++){
            loc_min = Math.min(loc_min,List_of_result[i][1]);
        };
        for (let i=0;i<List_of_result.length;i++){
            if (List_of_result[i][1]===loc_min){
                return List_of_result[i][0];
            };
        };
    };
    /*##############################################################################################*/
    /*                                  Fonctions de modification                                   */
    /*##############################################################################################*/
    calculate_for_all_line(f, result_name, ...Args){
        var end = this.search_column(result_name);
        if (end==-1){this.values[this.line_of_names].push(result_name)};
        var used = [];
        for (const arg of Args){
            used.push(this.search_column(arg));
        };
        for (let i=this.line_of_names+1;i<this.values.length;i++){
            var to_calculate = [];
            for (let index_i=0; index_i<used.length;index_i++){
                if (used[index_i]==-1){to_calculate.push(null)}else{to_calculate.push(this.values[i][used[index_i]])};
            };
            var result = f.apply(null,to_calculate)
            if (end==-1){
                this.values[i].push(result);
            }else{
                this.values[i][end]=result;
            }
        };
        this.#actualize();
    };
    /*##############################################################################################*/
    /*                                        Fonctions geo                                         */
    /*##############################################################################################*/
    get_adress(l_country=["Pays","Country"],l_cp="code postal",l_city=["Ville", "Commune"],l_adress = ["adresse","adress"],l_road=["Rue","Voie","Route"],l_num=["numéro","numéro de voie"]){
        this.adress=[];this.to_search_lat_lng=[];this.coord=[];
        const coun_num = this.search_column(l_country);
        const cp_num = this.search_column(l_cp);
        const city_num = this.search_column(l_city);
        const adress_num = this.search_column(l_adress);
        const road_num = this.search_column(l_road);
        const num_num = this.search_column(l_num);
        for (let i=0;i<this.line_of_names+1;i++){
            this.adress.push("");
            this.coord.push("");
        }
        if (adress_num==-1 && ( road_num==-1 || num_num==-1 )){
            alert("aucune adresse n'a été trouvée")
        }else{
            for (let i=this.line_of_names+1;i<this.values.length;i++){
                var global_adress="";
                if (adress_num==-1){
                    global_adress = this.values[i][num_num]+" "+this.values[i][road_num];
                }else{
                    global_adress = this.values[i][adress_num];
                };
                console.log(global_adress)
                if ((!(cp_num==-1)) && (!(global_adress.includes(this.values[i][cp_num])))){
                    global_adress = global_adress+", "+this.values[i][cp_num];
                };
                if ((!(city_num==-1)) && (!(global_adress.includes(this.values[i][city_num])))){
                    global_adress = global_adress+", "+this.values[i][city_num];
                };
                if ((!(coun_num==-1)) && (!(global_adress.includes(this.values[i][coun_num])))){
                    global_adress = global_adress+", "+this.values[i][coun_num];
                };
                this.adress.push(global_adress)
                this.coord.push("");
                this.to_search_lat_lng.push(i)
            };
            this.#search_lat_lng();
        };
    };
    #search_lat_lng_(index){
        const adress = this.adress[index];
        if (adress==""){
            this.coord[index] = "";
            setTimeout(this.#search_lat_lng(),this.sleeping_time_lat_lng);
        }else{
            var elem=this;
            let xhr = new XMLHttpRequest();
            xhr.open("GET", "https://api-adresse.data.gouv.fr/search/?q="+adress+"&limit=10");
            xhr.setRequestHeader("Accept", "application/json");
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.onreadystatechange = function () {if (xhr.readyState === 4) {
                var response = JSON.parse(xhr.responseText);
                elem.coord[index]=response["features"][0]["geometry"]["coordinates"]
                setTimeout(elem.#search_lat_lng(),elem.sleeping_time_lat_lng);
            }};
            xhr.send();
        };
    };
    #search_lat_lng(){
        this.running_lat_lng=true;
        if (this.to_search_lat_lng.length==0){
            this.running_lat_lng=false;
            for (let i=0; i<this.coord.length;i++){
                if (i==this.line_of_names){
                    this.values[i].push("Longitude");
                    this.values[i].push("Latitude");
                }else{
                    if (this.coord[i]==""){
                        this.values[i].push(null);
                        this.values[i].push(null);
                    }else{
                        this.values[i].push(this.coord[i][0]);
                        this.values[i].push(this.coord[i][1]);
                    };
                };
            };
            this.#actualize();
        }else{
            this.#search_lat_lng_(this.to_search_lat_lng.pop());
        };
    };
    /*##############################################################################################*/
    /*                                  Fonctions de visualisation                                  */
    /*##############################################################################################*/
    #show_in_table(table_element){
        table_element.innerHTML="";
        var head = document.createElement("thead")
        for (let i=0;i<this.line_of_names+1;i++){
            var l = document.createElement("tr")
            for (let j=0;j<this.values[i].length;j++){
                var c = document.createElement("th");
                c.innerHTML = this.values[i][j];
                l.appendChild(c);
            };
            head.appendChild(l)
        };
        table_element.appendChild(head)
        var body = document.createElement("tbody")
        for (let i=this.line_of_names+1;i<this.values.length;i++){
            var l = document.createElement("tr")
            for (let j=0;j<this.values[i].length;j++){
                var c = document.createElement("td");
                c.innerHTML = this.values[i][j];
                l.appendChild(c);
            };
            body.appendChild(l)
        };
        table_element.appendChild(body);
    };
    set_vizualiser_id(id){
        this.vizualize_id.push(id)
    };
    #actualize(){
        for (let i=0;i<this.vizualize_id.length;i++){
            this.#show_in_table(document.getElementById(this.vizualize_id[i]));
        };
    };
};